import type { LifecycleStatus } from '../../../../../../../../common/module/constants/lifecycle-status.enum';

export interface GetDocumentIdsByFilterRequestDto {
  documentObjectType?: string;
  userId?: string;
  roles: string[];
  lifecycleStatuses: LifecycleStatus[];
}
