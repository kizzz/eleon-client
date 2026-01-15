import {
  CreateTaskDto,
  TaskHeaderDto,
} from '@eleon/job-scheduler-proxy';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '@eleon/job-scheduler-proxy';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
  SortEvent,
} from 'primeng/api';
import { JobSchedulerTaskStatus } from '@eleon/job-scheduler-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';
import { handleError } from '@eleon/angular-sdk.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { TaskHubService } from '../../../task-services/task-hub.service';
interface TaskRow {
  data: TaskHeaderDto;
  status: {
    localized: string;
    key: string;
    icon: string;
  };
  canBeRun: boolean;
}

@Component({
  standalone: false,
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: TaskRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  searchQueryText: string;
  searchQuery: string;

  showCreateDialog = false;

  newTask: CreateTaskDto;

  @PageControls() controls = contributeControls([
    {
      key: 'Infrastructure::Reload',
      icon: 'fa fa-sync',
      severity: 'warning',
      action: () => this.reloadTasks(),
      show: () => true,
      disabled: () => false,
      loading: () => this.loading,
    },
    {
      key: 'JobScheduler::Tasks:CreateTask',
      icon: 'fa fa-plus',
      severity: 'primary',
      action: () => this.createTask(),
      show: () => true,
      disabled: () => false,
      loading: () => this.loading,
    },
  ]);

  constructor(
    public taskHub: TaskHubService,
    public taskService: TaskService,
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    public confirmationService: ConfirmationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToTaskUpdate();
    return;
  }

  loadTasks(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortOrder: string = event.sortOrder < 0 ? 'asc' : 'desc';
    const sortField: string = event.sortField || 'lastRunTimeUtc';
    const sorting: string = sortField + ' ' + sortOrder;
    this.taskService
      .getList({
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
        nameFilter: this.searchQuery,
      })
      .subscribe((rows) => {
        this.rows = rows.items.map((i) => {
          let statusIcon = '';
          if (i.status === JobSchedulerTaskStatus.Inactive)
            statusIcon = 'pi pi-circle-fill';
          else if (i.status === JobSchedulerTaskStatus.Ready)
            statusIcon = 'pi pi-circle';
          else if (i.status === JobSchedulerTaskStatus.Running)
            statusIcon = 'pi pi-caret-right';
          return {
            data: i,
            status: {
              localized: this.localizationService.instant(
                'JobScheduler::TaskStatus:' + JobSchedulerTaskStatus[i.status]
              ),
              key: JobSchedulerTaskStatus[i.status].toLowerCase(),
              icon: statusIcon,
            },
            canBeRun:
              i.status === JobSchedulerTaskStatus.Ready && i.canRunManually,
          };
        });
        this.totalRecords = rows.totalCount;
        this.loading = false;
      });
  }

  runTask(row: TaskRow): void {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        'JobScheduler::Tasks:Run:Confirm'
      ),
      accept: () => {
        this.taskService.runTaskManually(row.data.id).subscribe({
          next: (wasRun) => {
            if (wasRun) {
              this.success('JobScheduler::Tasks:RunSuccess');
              this.reloadTasks();
            } else {
              this.error('JobScheduler::Tasks:RunFail');
            }
          },
          error: () => {
            this.error('JobScheduler::Tasks:RunError');
          },
        });
      },
      acceptLabel: this.localizationService.instant('CoreInfrastructure::Yes'),
      rejectLabel: this.localizationService.instant('CoreInfrastructure::No'),
    });
  }

  reloadTasks() {
    if (this.lastLoadEvent != null) this.loadTasks(this.lastLoadEvent);
  }

  sort(event: SortEvent) {
    console.log(event);
  }

  editTask(row: TaskRow) {
    this.router.navigate(['/job-scheduler/tasks/details', row.data.id]);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadTasks(this.lastLoadEvent);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadTasks(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadTasks(this.lastLoadEvent);
  }

  error(msg: string) {
    this.messageService.error(msg);
  }

  success(msg: string) {
    this.messageService.success(msg);
  }

  createTask() {
    this.newTask = {
      name: '',
      description: '',
    };
    this.showCreateDialog = true;
  }

  onTaskCreate() {
    if (!this.validateNewTask()) {
      return;
    }

    this.loading = true;
    this.taskService
      .create(this.newTask)
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.error(err.message))
      )
      .subscribe((task) => {
        this.showCreateDialog = false;
        this.router.navigate(['/job-scheduler/tasks/details', task.id], {
          queryParams: { editing: true },
        });
      });
  }

  onTaskCreateCancel() {
    this.showCreateDialog = false;
  }

  validateNewTask() {
    let valid = true;
    if (!this.newTask) {
      this.newTask = {};
    }
    this.newTask.name = this.newTask.name?.trim();
    if (!this.newTask.name) {
      this.error('JobScheduler::Tasks:Errors:NameEmpty');
      valid = false;
    }

    this.newTask.description = this.newTask.description?.trim();

    return valid;
  }

  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  private subscribeToTaskUpdate(): void {
    this.taskHub.taskCompleted$.subscribe((task) => {
      this.rows = this.rows.map((row) => {
        if (row.data.id === task.id) {
          row.data = { ...row.data, ...task };
        }
        return row;
      });
    });
  }
}
