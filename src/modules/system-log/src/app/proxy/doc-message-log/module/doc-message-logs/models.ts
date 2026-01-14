import type { SystemLogLevel } from '../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface SystemLogDto {
  id?: string;
  message?: string;
  logLevel: SystemLogLevel;
  applicationName?: string;
  initiatorId?: string;
  initiatorType?: string;
  creationTime?: string;
  isArchived: boolean;
  count: number;
  lastModificationTime?: string;
  lastModifierId?: string;
}

export interface SystemLogListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  docIdFilter?: string;
  minLogLevelFilter?: SystemLogLevel;
  initiatorFilter?: string;
  initiatorTypeFilter?: string;
  applicationNameFilter?: string;
  creationFromDateFilter?: string;
  creationToDateFilter?: string;
  onlyUnread: boolean;
}

export interface UnresolvedSystemLogCountDto {
  criticalUnresolvedCount: number;
  warningUnresolvedCount: number;
}
