import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { LifecycleApprovalType } from '../../../../common/module/constants/lifecycle-approval-type.enum';

export interface GetStatesGroupsDto extends PagedAndSortedResultRequestDto {
  documentObjectType?: string;
}

export interface StateSwitchDto {
  id?: string;
  newState: boolean;
}

export interface StatesGroupSwitchDto {
  id?: string;
  newState: boolean;
}

export interface UpdateApprovalTypeDto {
  id?: string;
  newApprovalType: LifecycleApprovalType;
}

export interface UpdateOrderIndexDto {
  id?: string;
  orderIndex: number;
}
