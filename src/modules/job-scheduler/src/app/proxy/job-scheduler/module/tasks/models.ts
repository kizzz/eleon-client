import type { JobSchedulerTaskExecutionStatus } from '../../../common/module/constants/job-scheduler-task-execution-status.enum';
import type { ActionExecutionDto } from '../actions/models';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { JobSchedulerTaskStatus } from '../../../common/module/constants/job-scheduler-task-status.enum';

export interface TaskExecutionDto {
  id?: string;
  status: JobSchedulerTaskExecutionStatus;
  runnedByUserId?: string;
  runnedByUserName?: string;
  runnedByTriggerId?: string;
  runnedByTriggerName?: string;
  startedAtUtc?: string;
  finishedAtUtc?: string;
  taskId?: string;
  actionExecutions: ActionExecutionDto[];
}

export interface TaskExecutionListRequestDto extends PagedAndSortedResultRequestDto {
}

export interface TaskHeaderDto {
  id?: string;
  isActive: boolean;
  name?: string;
  description?: string;
  canRunManually: boolean;
  restartAfterFailIntervalSeconds?: number;
  restartAfterFailMaxAttempts: number;
  timeoutSeconds?: number;
  allowForceStop: boolean;
  lastRunTimeUtc?: string;
  nextRunTimeUtc?: string;
  status: JobSchedulerTaskStatus;
  lastDurationSeconds?: number;
  onFailureRecepients?: string;
}

export interface TaskListRequestDto extends PagedAndSortedResultRequestDto {
  nameFilter?: string;
}
