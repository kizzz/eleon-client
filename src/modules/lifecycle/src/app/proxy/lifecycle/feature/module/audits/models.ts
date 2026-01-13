import type { EntityDto, PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { LifecycleStatus } from '../../../../common/module/constants/lifecycle-status.enum';

export interface PendingApprovalRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  statusDateFilterStart?: string;
  statusDateFilterEnd?: string;
  objectTypeFilter: string[];
  userId?: string;
  statesGroupTemplateId?: string;
}

export interface StatesGroupAuditReportDto extends EntityDto<string> {
  documentId?: string;
  documentObjectType?: string;
  groupName?: string;
  status: LifecycleStatus;
  lastModifierId?: string;
  lastModificationTime?: string;
  creationTime?: string;
  statusDate?: string;
  role?: string;
  extraProperties: Record<string, object>;
}
