import type { LifecycleConditionTargetType } from '../../../../common/module/constants/lifecycle-condition-target-type.enum';
import type { DocumentTemplateElementMapFunctionType } from '../../../../common/module/constants/document-template-element-map-function-type.enum';

export interface ConditionDto {
  id?: string;
  conditionType: LifecycleConditionTargetType;
  refId?: string;
  rules: RuleDto[];
}

export interface ReplyCheckRuleDto {
  id?: string;
  result: boolean;
}

export interface RuleDto {
  functionType: DocumentTemplateElementMapFunctionType;
  function?: string;
}
