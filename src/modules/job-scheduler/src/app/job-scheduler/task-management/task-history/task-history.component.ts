import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { JobSchedulerTaskExecutionStatus } from '@eleon/job-scheduler-proxy';
import { JobSchedulerActionExecutionStatus } from '@eleon/job-scheduler-proxy';
import { ActionExecutionDto } from '@eleon/job-scheduler-proxy';
import { TaskService } from '@eleon/job-scheduler-proxy';
import { TaskExecutionDto } from '@eleon/job-scheduler-proxy';
import { LazyLoadEvent } from 'primeng/api';
import { Router } from '@angular/router';

interface ActionExecutionRow {
  data: ActionExecutionDto;
  localizedStatus: string;
  statusIcon: string;
  statusKey: string;
}

interface TaskExecutionRow {
  data: TaskExecutionDto;
  localizedStatus: string;
  statusIcon: string;
  actionExecutions: ActionExecutionRow[];
  statusKey: string;
}

@Component({
  standalone: false,
  selector: 'app-task-history',
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss'],
})
export class TaskHistoryComponent implements OnInit, OnChanges {
  taskExecutions: TaskExecutionRow[];
  rowsCount: number = 10;
  totalRecords: number = 0;
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;

  //for testing, remove after adding normal notificaitons
  dataSnapshot: string;

  @Input()
  taskId: string;

  constructor(
    public localizationService: ILocalizationService,
    public taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    //setInterval(() => this.reloadTaskExecutions(), 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taskId) {
      this.reloadTaskExecutions();
    }
  }

  getTaskExecutionStatusIcon(dto: TaskExecutionDto): string {
    if (dto.status === JobSchedulerTaskExecutionStatus.Cancelled)
      return 'fas fa-x';
    if (dto.status === JobSchedulerTaskExecutionStatus.Initializing)
      return 'pi pi-spin pi-spinner';
    if (dto.status === JobSchedulerTaskExecutionStatus.Executing)
      return 'pi pi-spin pi-spinner';
    if (dto.status === JobSchedulerTaskExecutionStatus.Failed)
      return 'fas fa-ban';
    if (dto.status === JobSchedulerTaskExecutionStatus.Completed)
      return 'fas fa-check-double';
  }

  getActionExecutionStatusIcon(dto: ActionExecutionDto): string {
    if (dto.status === JobSchedulerActionExecutionStatus.NotStarted)
      return 'pi pi-circle-fill';
    if (dto.status === JobSchedulerActionExecutionStatus.Executing)
      return 'pi pi-spin pi-spinner';
    if (dto.status === JobSchedulerActionExecutionStatus.Failed)
      return 'fas fa-ban';
    if (dto.status === JobSchedulerActionExecutionStatus.Completed)
      return 'fas fa-check-double';
    if (dto.status === JobSchedulerActionExecutionStatus.Cancelled)
      return 'fas fa-x';
  }

  reloadTaskExecutions() {
    if (this.lastLoadEvent != null) this.loadTaskExecutions(this.lastLoadEvent);
  }

  loadTaskExecutions(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    //this.loading = true;
    //const sortOrder: string = event.sortOrder > 0 ? 'asc' : 'desc';
    //const sortField: string = event.sortField || 'id';
    //const sorting: string = sortField + ' ' + sortOrder;
    const sorting: string = 'startedAtUtc desc';
    this.taskService
      .getTaskExecutionList(this.taskId, {
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
      })
      .subscribe((executions) => {
        const newSnapshot = JSON.stringify(executions);
        if (this.dataSnapshot !== newSnapshot) {
          this.dataSnapshot = newSnapshot;
          this.taskExecutions = executions.items.map((x) => ({
            data: x,
            statusIcon: this.getTaskExecutionStatusIcon(x),
            localizedStatus: this.localizationService.instant(
              'JobScheduler::TaskExecutionStatus:' +
                JobSchedulerTaskExecutionStatus[x.status]
            ),
            statusKey: JobSchedulerTaskExecutionStatus[x.status]?.toLowerCase(),
            actionExecutions: this.mapActionExecutions(x.actionExecutions),
          }));
          this.totalRecords = executions.totalCount;
          this.loading = false;
        }
      });
  }

  mapActionExecutions(dtos: ActionExecutionDto[]): ActionExecutionRow[] {
    let unordered = dtos.map((a) => ({
      data: {
        ...a,
        startedAt: a.startedAtUtc,
        completedAt: a.completedAtUtc,
      },
      statusIcon: this.getActionExecutionStatusIcon(a),
      localizedStatus: this.localizationService.instant(
        'JobScheduler::ActionExecutionStatus:' +
          JobSchedulerActionExecutionStatus[a.status]
      ),
      statusKey: JobSchedulerActionExecutionStatus[a.status]?.toLowerCase(),
    }));
    return unordered;
  }

  openJob(jobId: string) {
    this.router.navigate(['background-job/details', jobId]);
  }
  
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
  navigateToBackgroundJobs(taskExecutionId: string) {
    this.router.navigate(['/background-job/dashboard'], {
      queryParams: { taskExecutionid: taskExecutionId },
    });
  }
}
