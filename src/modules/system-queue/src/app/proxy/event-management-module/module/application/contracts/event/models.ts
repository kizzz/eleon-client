import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface AckRequestDto {
  lockId?: string;
  messageIds: string[];
}

export interface ClaimMessagesRequestDto {
  queueName?: string;
  maxCount: number;
  lockSeconds: number;
}

export interface ClaimMessagesResponseDto {
  lockId?: string;
  queueStatus?: string;
  pendingCount: number;
  messages: ClaimedMessageDto[];
}

export interface ClaimedMessageDto {
  id?: string;
  tenantId?: string;
  name?: string;
  message?: string;
  token?: string;
  claims?: string;
  attempts: number;
  createdUtc?: string;
  messageKey?: string;
  traceId?: string;
}

export interface EventDto {
  id?: string;
  tenantId?: string;
  name?: string;
  queueId?: string;
  creationTime?: string;
  createdUtc?: string;
  status: number;
  attempts: number;
  lockedUntilUtc?: string;
  visibleAfterUtc?: string;
  messageKey?: string;
  traceId?: string;
  length: number;
}

export interface FullEventDto {
  id?: string;
  tenantId?: string;
  name?: string;
  queueId?: string;
  message?: string;
  creationTime?: string;
  createdUtc?: string;
  token?: string;
  claims?: string;
  status: number;
  attempts: number;
  lockedUntilUtc?: string;
  visibleAfterUtc?: string;
  messageKey?: string;
  traceId?: string;
}

export interface MessagesPagedAndSortedResultRequestDto extends PagedAndSortedResultRequestDto {
  queueId?: string;
}

export interface NackRequestDto {
  lockId?: string;
  messageId?: string;
  maxAttempts: number;
  delaySeconds: number;
  error?: string;
}

export interface PublishMessageRequestDto {
  name?: string;
  queueName?: string;
  message?: string;
}
