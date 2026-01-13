import type { LifecycleFinishedStatus } from '../../../../../common/module/constants/lifecycle-finished-status.enum';
import type { LifecycleActorTypes } from '../../../../../common/module/constants/lifecycle-actor-types.enum';
import type { LifecycleActorStatus } from '../../../../../common/module/constants/lifecycle-actor-status.enum';
import type { LifecycleStatus } from '../../../../../common/module/constants/lifecycle-status.enum';

export interface CurrentStatusDto {
  key: LifecycleFinishedStatus;
  value?: string;
}

export interface StateActorAuditDto {
  id?: string;
  stateId?: string;
  orderIndex?: number;
  isConditional: boolean;
  ruleId?: string;
  isApprovalNeeded: boolean;
  isFormAdmin: boolean;
  isApprovalManager: boolean;
  isApprovalAdmin: boolean;
  isActive: boolean;
  actorName?: string;
  actorType: LifecycleActorTypes;
  refId?: string;
  statusUserName?: string;
  statusUserId?: string;
  statusDate?: string;
  status: LifecycleActorStatus;
  reason?: string;
}

export interface StateAuditDto {
  id?: string;
  statesGroupId?: string;
  orderIndex: number;
  isActive: boolean;
  stateName?: string;
  isMandatory: boolean;
  isReadOnly: boolean;
  approvalType: number;
  currentActorOrderIndex?: number;
  status: LifecycleStatus;
  currentStatus: CurrentStatusDto;
  creationTime?: string;
}

export interface StatesGroupAuditDto {
  id?: string;
  documentId?: string;
  documentObjectType?: string;
  groupName?: string;
  currentStateOrderIndex?: number;
  creatorId?: string;
  status: LifecycleStatus;
  statesGroupTemplateId?: string;
  currentStatus: CurrentStatusDto;
}
