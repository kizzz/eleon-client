import type { LifecycleStatus } from '../../../../common/module/constants/lifecycle-status.enum';
import type { LifecycleActorStatus } from '../../../../common/module/constants/lifecycle-actor-status.enum';
import type { LifecycleActorTypes } from '../../../../common/module/constants/lifecycle-actor-types.enum';
import type { LifecycleApprovalType } from '../../../../common/module/constants/lifecycle-approval-type.enum';
import type { StateActorAuditDto, StateAuditDto, StatesGroupAuditDto } from '../dto/audits/models';

export interface LifecycleStatusDto {
  lifecycleStatus: LifecycleStatus;
  statusDate?: string;
  actorStatus: LifecycleActorStatus;
  actorName?: string;
  actorType: LifecycleActorTypes;
  lifecycleApprovalType: LifecycleApprovalType;
  rejectedReason?: string;
}

export interface StateActorAuditTreeDto extends StateActorAuditDto {
  displayName?: string;
}

export interface StateAuditTreeDto extends StateAuditDto {
  actors: StateActorAuditTreeDto[];
  currentActor: StateActorAuditDto;
}

export interface StatesGroupAuditTreeDto extends StatesGroupAuditDto {
  states: StateAuditTreeDto[];
  currentState: StateAuditTreeDto;
  extraProperties: Record<string, object>;
}
