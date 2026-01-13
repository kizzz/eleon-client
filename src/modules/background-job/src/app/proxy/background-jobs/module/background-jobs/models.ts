import type { BackgroundJobExecutionStatus } from '../../../common/module/constants/background-job-execution-status.enum';
import type { BackgroundJobStatus } from '../../../common/module/constants/background-job-status.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { BackgroundJobMessageType } from '../../../common/module/constants/background-job-message-type.enum';

export interface BackgroundJobDto extends BackgroundJobHeaderDto {
  startExecutionParams?: string;
  startExecutionExtraParams?: string;
  result?: string;
  executions: BackgroundJobExecutionDto[];
}

export interface BackgroundJobExecutionCompleteDto {
  paramsForRetryExecution?: string;
  extraParamsForRetryExecution?: string;
  status: BackgroundJobExecutionStatus;
  type?: string;
  executionId?: string;
  backgroundJobId?: string;
  messages: BackgroundJobMessageDto[];
  result?: string;
}

export interface BackgroundJobExecutionDto {
  id?: string;
  tenantId?: string;
  creationTime?: string;
  executionStartTimeUtc?: string;
  executionEndTimeUtc?: string;
  status: BackgroundJobExecutionStatus;
  isRetryExecution: boolean;
  retryUserInitiatorId?: string;
  startExecutionParams?: string;
  startExecutionExtraParams?: string;
  backgroundJobEntityId?: string;
  messages: BackgroundJobMessageDto[];
  statusChangedBy?: string;
  isStatusChangedManually: boolean;
}

export interface BackgroundJobHeaderDto {
  id?: string;
  parentJobId?: string;
  creationTime?: string;
  type?: string;
  initiator?: string;
  status: BackgroundJobStatus;
  scheduleExecutionDateUtc?: string;
  jobFinishedUtc?: string;
  lastExecutionDateUtc?: string;
  isRetryAllowed: boolean;
  description?: string;
  sourceId?: string;
  sourceType?: string;
  timeoutInMinutes: number;
  retryIntervalInMinutes: number;
  maxRetryAttempts: number;
  currentRetryAttempt: number;
  nextRetryTimeUtc?: string;
  onFailureRecepients?: string;
}

export interface BackgroundJobListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  statusFilter: BackgroundJobStatus[];
  objectTypeFilter: string[];
  typeFilter: string[];
  creationDateFilterStart?: string;
  creationDateFilterEnd?: string;
  lastExecutionDateFilterStart?: string;
  lastExecutionDateFilterEnd?: string;
}

export interface BackgroundJobMessageDto {
  textMessage?: string;
  messageType: BackgroundJobMessageType;
  creationTime?: string;
}

export interface CreateBackgroundJobDto {
  parentJobsIds: string[];
  type?: string;
  initiator?: string;
  scheduleExecutionDateUtc?: string;
  isRetryAllowed: boolean;
  description?: string;
  startExecutionParams?: string;
  startExecutionExtraParams?: string;
  timeoutInMinutes: number;
  retryInMinutes: number;
  maxRetryAttempts: number;
  onFailureRecepients?: string;
}

export interface FullBackgroundJobDto extends BackgroundJobDto {
  extraProperties: Record<string, string>;
}
