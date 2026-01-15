import type { TextFormat } from '../../../common/module/constants/text-format.enum';
import type { JobSchedulerActionExecutionStatus } from '../../../common/module/constants/job-scheduler-action-execution-status.enum';

export interface ActionDto {
  id?: string;
  displayName?: string;
  eventName?: string;
  taskId?: string;
  actionParams?: string;
  actionExtraParams?: string;
  retryInterval?: number;
  maxRetryAttempts: number;
  parentActionIds: string[];
  timeoutInMinutes: number;
  onFailureRecepients?: string;
  paramsFormat: TextFormat;
}

export interface DuplicateActionRequestDto {
  id?: string;
  count: number;
  fieldToModify?: string;
}

export interface ActionExecutionDto {
  id?: string;
  status: JobSchedulerActionExecutionStatus;
  jobId?: string;
  parentActionExecutionIds: string[];
  eventName?: string;
  actionName?: string;
  startedAtUtc?: string;
  completedAtUtc?: string;
  statusChangedBy?: string;
  isStatusChangedManually: boolean;
}
