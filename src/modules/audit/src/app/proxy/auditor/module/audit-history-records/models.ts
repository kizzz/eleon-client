import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface DocumentHistoryRequest extends PagedAndSortedResultRequestDto {
  documentObjectType?: string;
  documentId?: string;
  fromDateFilter?: string;
  toDateFilter?: string;
}
