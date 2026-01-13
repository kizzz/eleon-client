import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface FullEventDto {
  id?: string;
  tenantId?: string;
  name?: string;
  queueId?: string;
  message?: string;
  creationTime?: string;
}

export interface EventDto {
  id?: string;
  tenantId?: string;
  name?: string;
  queueId?: string;
  creationTime?: string;
  length: number;
}

export interface MessagesPagedAndSortedResultRequestDto extends PagedAndSortedResultRequestDto {
  queueId?: string;
}

export interface PublishMessageRequestDto {
  name?: string;
  queueName?: string;
  message?: string;
}
