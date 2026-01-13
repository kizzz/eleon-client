import type { LifecycleActorTypes } from '../../../../../common/module/constants/lifecycle-actor-types.enum';
import type { LifecycleApprovalType } from '../../../../../common/module/constants/lifecycle-approval-type.enum';

export interface FullStateTemplateDto extends StateTemplateDto {
  actors: StateActorTemplateDto[];
}

export interface FullStatesGroupTemplateDto extends StatesGroupTemplateDto {
  states: FullStateTemplateDto[];
}

export interface StateActorTaskListSettingTemplateDto {
  documentObjectType?: string;
  taskListId?: string;
}

export interface StateActorTemplateDto {
  id?: string;
  stateTemplateId?: string;
  actorName?: string;
  orderIndex?: number;
  refId?: string;
  actorType: LifecycleActorTypes;
  isConditional: boolean;
  ruleId?: string;
  isApprovalNeeded: boolean;
  isFormAdmin: boolean;
  isApprovalManager: boolean;
  isApprovalAdmin: boolean;
  isActive: boolean;
  taskLists: StateActorTaskListSettingTemplateDto[];
  displayName?: string;
}

export interface StateTemplateDto {
  id?: string;
  statesGroupTemplateId?: string;
  isActive: boolean;
  orderIndex?: number;
  stateName?: string;
  isMandatory: boolean;
  isReadOnly: boolean;
  approvalType: LifecycleApprovalType;
  creationTime?: string;
}

export interface StatesGroupTemplateDto {
  id?: string;
  documentObjectType?: string;
  groupName?: string;
  isActive: boolean;
}
