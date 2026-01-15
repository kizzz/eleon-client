import { ILocalizationService, ITemplatingDialogService } from '@eleon/angular-sdk.lib';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskDto, TaskExecutionDto } from '@eleon/job-scheduler-proxy';
import { TaskService } from '@eleon/job-scheduler-proxy';
import { Table } from 'primeng/table';
import { TriggerService } from '@eleon/job-scheduler-proxy';
import { TriggerDto } from '@eleon/job-scheduler-proxy';
import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { ActionDto } from '@eleon/job-scheduler-proxy';
import { JobSchedulerTaskExecutionStatus, JobSchedulerTaskStatus } from '@eleon/job-scheduler-proxy';
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { contributeControls, PAGE_CONTROLS, PageControls } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { Location } from '@angular/common';
import { finalize } from 'rxjs'
import { handleError } from '@eleon/angular-sdk.lib'
import { TaskHubService } from '../../../task-services/task-hub.service';
import { ActionSettingsComponent } from '../../action-management/action-settings/action-settings.component';
import { TaskHistoryComponent } from '../task-history/task-history.component';
import { TriggerSettingsComponent } from '../../trigger-management/trigger-settings/trigger-settings.component';

interface Task {
  data: TaskDto,
  name: string;
  description: string;
  restartAfterFailSet: boolean;
  selectedRestartInterval: LocalizedValue;
  selectedTimeout: LocalizedValue;
  timeoutSet: boolean;
  autodeleteSet: boolean;
  selectedAutodelete: LocalizedValue;
	onFailureRecipients: string[];
  status: {
    localized: string;
    key: string;
    icon: string;
  }
  validators: {
    nameEmpty: boolean;
    restartMaxAttemptsEmpty: boolean;
    actionsEmpty: boolean;
  },
}

interface LocalizedValue {
  name: string;
  value: number;
}

@Component({
  standalone: false,
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
	editing = false;
  header: Task = { data: {}, validators: {}, status: {}} as Task;
  title: string;
  loadingTask: boolean = false;
  intervals: LocalizedValue[];
  longIntervals: LocalizedValue[];
  newRecipient = '';

  @ViewChild(ActionSettingsComponent)
  actionSettingsComponent: ActionSettingsComponent;

  @ViewChild(TaskHistoryComponent)
  taskHistoryComponent: TaskHistoryComponent;

  @ViewChild(TriggerSettingsComponent)
  triggerSettingsComponent: TriggerSettingsComponent;

	@PageControls() controls = contributeControls([
    {
			key: 'JobScheduler::Delete',
			icon: 'fa fa-trash',
			severity: 'danger',
			action: () => this.deleteTask(),
			show: () => !this.editing && (this.header.data.status === JobSchedulerTaskStatus.Ready || this.header.data.status === JobSchedulerTaskStatus.Inactive),
			disabled: () => false,
			loading: () => this.loadingTask,
		},
          PAGE_CONTROLS.RELOAD({
        key: 'JobScheduler::Refresh',
      show: () => true,
      loading: () => this.loadingTask,
      action: () => this.loadTask(this.header.data.id),
      disabled: () => this.loadingTask,
    }),
		{
			key: 'Infrastructure::Save',
			icon: 'fa fa-check',
			severity: 'primary',
			action: () => this.saveTask(),
			show: () => this.editing,
			disabled: () => false,
			loading: () => this.loadingTask,
		},
		{
			key: 'Infrastructure::Edit',
			icon: 'fa fa-edit',
			severity: 'warning',
			action: () => this.edit(),
			show: () => !this.editing && this.header.data.status != JobSchedulerTaskStatus.Running,
			disabled: () => false,
			loading: () => this.loadingTask,
		},
		{
			key: 'Infrastructure::Cancel',
			icon: 'fa fa-times',
			severity: 'danger',
			action: () => this.cancelTask(),
			show: () => this.editing,
			disabled: () => false,
			loading: () => this.loadingTask,
		},
		{
			key: 'Infrastructure::Stop',
			icon: 'fa fa-times',
			severity: 'danger',
			action: () => this.stopTask(),
			show: () => !this.editing && this.header.data.status == JobSchedulerTaskStatus.Running,
			disabled: () => false,
			loading: () => this.loadingTask,
		},
		{
			key: 'JobScheduler::Run',
			icon: 'fa fa-play',
			severity: 'success',
			action: () => this.runTask(),
			show: () => !this.editing && this.header.data.status === JobSchedulerTaskStatus.Ready && this.header.data.isActive && this.header.data.canRunManually,
			disabled: () => false,
			loading: () => this.loadingTask,
		},
	])

  constructor(
    public taskHub: TaskHubService,
    public localizationService: ILocalizationService,
    public tasksService: TaskService,
    public messageService: LocalizedMessageService,
    public router: Router,
    public route: ActivatedRoute,
		private localizedConfirmationService: LocalizedConfirmationService,
		public pageStateService: PageStateService,
  ) { }

  ngOnInit(): void {
    this.initIntervals();
    this.title = "";
    this.subscribeToRouteChanges();
    this.subscribeToTaskUpdate();
		this.editing = this.route.snapshot.queryParamMap.has('editing');
  }

  subscribeToRouteChanges(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.loadTask(params['id']);
      }
    });
  }

  loadTask(id: string): void {
    this.tasksService
      .getById(id)
      .subscribe({
        next: (task) => {
          this.initTask(task);
        }
      })
  }

  initTask(task: TaskDto): void {
    const restartAfterFailSet = !!task.restartAfterFailIntervalSeconds && !!task.restartAfterFailMaxAttempts;
    const timeoutSet = !!task.timeoutSeconds;
    let statusIcon = '';
    if (task.status === JobSchedulerTaskStatus.Inactive) statusIcon = 'pi pi-circle-fill';
    else if (task.status === JobSchedulerTaskStatus.Ready) statusIcon = 'pi pi-circle';
    else if (task.status === JobSchedulerTaskStatus.Running) statusIcon = 'pi pi-caret-right';
    this.header = {
      data: task,
      name: task.name,
      description: task.description,
      restartAfterFailSet,
      timeoutSet,
			onFailureRecipients: task.onFailureRecepients?.split(';')?.map(x => x.trim())?.filter(x => !!x) || [],
      selectedRestartInterval: restartAfterFailSet ? this.intervals.find(x => x.value === task.restartAfterFailIntervalSeconds) : null,
      selectedTimeout: timeoutSet ? this.intervals.find(x => x.value === task.timeoutSeconds) : null,
      autodeleteSet: false,
      selectedAutodelete: null,
      status: {
        localized: this.localizationService.instant('JobScheduler::TaskStatus:' + JobSchedulerTaskStatus[task.status]),
        key: JobSchedulerTaskStatus[task.status].toLowerCase(),
        icon: statusIcon,
      },
      validators: {
        nameEmpty: false,
        restartMaxAttemptsEmpty: false,
        actionsEmpty: false,
      }
    }
    this.newRecipient = '';

		this.editing = this.editing && task.status != JobSchedulerTaskStatus.Running;

    this.title = this.localizationService.instant('JobScheduler::Tasks:Title:Edit');

    this.reloadChildComponents();
  }

  initIntervals(): void {
    this.intervals = [
      { name: this.localizationService.instant(`JobScheduler::5Minutes`), value: 5 * 60 },
      { name: this.localizationService.instant(`JobScheduler::10Minutes`), value: 10 * 60 },
      { name: this.localizationService.instant(`JobScheduler::15Minutes`), value: 15 * 60 },
      { name: this.localizationService.instant(`JobScheduler::30Minutes`), value: 30 * 60 },
      { name: this.localizationService.instant(`JobScheduler::1Hour`), value: 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::6Hours`), value: 6 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::12Hours`), value: 12 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::1Day`), value: 24 * 60 * 60 },
    ];
    this.longIntervals = [
      { name: this.localizationService.instant(`JobScheduler::1Day`), value: 24 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::3Days`), value: 3 * 24 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::7Days`), value: 7 * 24 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::14Days`), value: 14 * 24 * 60 * 60 },
      { name: this.localizationService.instant(`JobScheduler::28Days`), value: 28 * 24 * 60 * 60 },
    ];
  }

  resetAllValidators(): void {
    this.resetNameValidators();
    this.resetRestartMaxAttemptsValidators();
    this.resetActionsValidators();
  }

  resetNameValidators(): void {
    this.header.validators.nameEmpty = false;
  }

  resetRestartMaxAttemptsValidators(): void {
    this.header.validators.restartMaxAttemptsEmpty = false;
  }

  resetActionsValidators(): void {
    this.header.validators.actionsEmpty = false;
  }

  canAddRecipient(): boolean {
    return !!this.newRecipient?.trim();
  }

  addRecipient(): void {
    const value = this.newRecipient?.trim();
    if (!value || !this.editing) {
      return;
    }

    if (!this.header.onFailureRecipients.includes(value)) {
      this.header.onFailureRecipients = [...this.header.onFailureRecipients, value];
      this.pageStateService.setDirty();
    }

    this.newRecipient = '';
  }

  removeRecipient(recipient: string): void {
    if (!this.editing) {
      return;
    }

    this.header.onFailureRecipients = this.header.onFailureRecipients.filter(r => r !== recipient);
    this.pageStateService.setDirty();
  }

  validateTask(): boolean {
    this.resetAllValidators();
    let errors: string[] = [];

		this.header.name = this.header.name?.trim();
    if (!this.header.name?.length) {
      this.header.validators.nameEmpty = true;
      errors.push('JobScheduler::Tasks:Errors:NameEmpty');
    }

    if (this.header.restartAfterFailSet
      && (isNaN(this.header.data.restartAfterFailMaxAttempts) || this.header.data.restartAfterFailMaxAttempts === null)) {
      this.header.validators.restartMaxAttemptsEmpty = true;
      errors.push('JobScheduler::Tasks:Errors:RestartMaxAttemptsEmpty');
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.error(err);
    }
    return false;
  }

  runTask(): void {
    if (this.header.data.status === JobSchedulerTaskStatus.Running) {
      this.error('JobScheduler::Errors:AlreadyRunning');
      return;
    }

    if (this.header.data.status === JobSchedulerTaskStatus.Inactive || !this.header.data.isActive) {
      this.error('JobScheduler::Errors:IsInactive');
      return;
    }

    this.loadingTask = true;
    this.tasksService
      .runTaskManually(this.header.data.id)
			.pipe(finalize(() => this.loadingTask = false),
					handleError(err => this.error(err.message)))
      .subscribe({
        next: (wasRun) => {
          if (wasRun) {
            this.success('JobScheduler::Tasks:RunSuccess');
            //this.loadTask();
						this.reloadSelf();
          }
          else {
            this.error('JobScheduler::Tasks:RunFail');
          }
        },
        error: () => {
          this.error('JobScheduler::Tasks:RunError');
        }
      })
  }

   deleteTask(): void {
    if (this.header.data.status === JobSchedulerTaskStatus.Running) {
      this.error('JobScheduler::Errors:CannotDeleteRunningTask');
      return;
    }
    this.localizedConfirmationService.confirm('JobScheduler::Task:Delete:Confirmation', () => {
      this.tasksService
      .delete(this.header.data.id)
			.pipe(finalize(() => this.loadingTask = false),
					handleError(err => this.error(err.message)))
      .subscribe({
        next: (wasDeleted) => {
          if (wasDeleted) {
            this.success('JobScheduler::Tasks:DeleteSuccess');
            this.router.navigate(['job-scheduler/tasks/list']);
          }
          else {
            this.error('JobScheduler::Tasks:DeleteFail');
          }
        },
        error: () => {
          this.error('JobScheduler::Tasks:DeleteError');
        }
      })
		});
  }


  onActiveChange(isActive: boolean): void {
    if (this.header.data.isActive) {
      const valid = this.validateTask();
      if (!valid) {
        setTimeout(() => this.header.data.isActive = false, 0);
      }
    }
  }

  saveTask(): void {
    const valid = this.validateTask();
    if (!valid) return;


    const dto: TaskDto = {
      ...this.header.data,
      name: this.header.name,
      description: this.header.description,
      restartAfterFailIntervalSeconds: this.header.restartAfterFailSet ? this.header.selectedRestartInterval.value : null,
      restartAfterFailMaxAttempts: this.header.restartAfterFailSet ? this.header.data.restartAfterFailMaxAttempts : 0,
      timeoutSeconds: this.header.timeoutSet ? this.header.selectedTimeout.value : null,
      onFailureRecepients: this.header.onFailureRecipients?.filter(r => r && r.length > 0).join(';') || '',
    };

    this.loadingTask = true;
    this.tasksService
    .update(dto)
		.pipe(finalize(() => this.loadingTask = false),
		handleError(err => this.error(err.message)))
    .subscribe((wasSaved) => {
        if (wasSaved) {
          this.success('JobScheduler::Tasks:SaveSuccess');
          this.loadTask(this.header.data.id);
					this.pageStateService.setNotDirty();
					this.editing = false;
        }
        else {
          this.error('JobScheduler::Tasks:SaveFail');
        }
      });
  }

  error(msg: string) {
    this.messageService.error(msg);
  }

  success(msg: string) {
    this.messageService.success(msg);
  }

	edit(){
		this.editing = true;
	}

	cancelTask(){
		this.pageStateService.confirmResettingDirty().then(confirmed => {
			if (confirmed) {
				this.editing = false;
				this.loadTask(this.header.data.id);
			}
		})
	}

	stopTask(){
		this.localizedConfirmationService.confirm('JobScheduler::Task:Stop:Confirmation', () => {
			this.loadingTask = true;
			this.tasksService
				.stopTask(this.header.data.id)
				.pipe(finalize(() => this.loadingTask = false), handleError(err => this.error(err.message)))
				.subscribe({
					next: (wasStopped) => {
						if (wasStopped) {
							this.success('JobScheduler::Tasks:StopSuccess');
							this.reloadSelf();
							// this.loadTask();
						} else {
							this.error('JobScheduler::Tasks:StopFail');
						}
					},
					error: () => {
						this.error('JobScheduler::Tasks:StopError');
					},
					complete: () => this.loadingTask = false
				});
		});
	}

	ngOnDestroy(): void {
		this.pageStateService.setNotDirty();
	}

	reloadSelf() {
		const url = this.router.url;
		this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
			this.router.navigateByUrl(url);
		});
	}
  
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  private subscribeToTaskUpdate(): void {
    this.taskHub.taskCompleted$.subscribe((task) => {
      if (this.header?.data?.id === task.id) {
        this.loadTask(this.header.data.id);
      }
    })
  }

  private reloadChildComponents(): void {
    // Use setTimeout to ensure child components are initialized (they might be in tabs)
    setTimeout(() => {
      if (this.actionSettingsComponent) {
        this.actionSettingsComponent.loadActions();
      }
      if (this.taskHistoryComponent) {
        this.taskHistoryComponent.reloadTaskExecutions();
      }
      if (this.triggerSettingsComponent) {
        this.triggerSettingsComponent.loadTriggers();
      }
    }, 0);
  }
}
