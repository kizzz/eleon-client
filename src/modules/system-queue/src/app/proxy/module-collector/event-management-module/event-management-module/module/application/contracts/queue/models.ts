import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface QueueRequestDto {
  queueName?: string;
}

export interface QueuesListRequestDto extends PagedAndSortedResultRequestDto {
}
