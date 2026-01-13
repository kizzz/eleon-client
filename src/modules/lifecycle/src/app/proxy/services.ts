import { StateActorAuditService } from './lifecycle/feature/module/controllers/audits/state-actor-audit.service';
import { StateAuditService } from './lifecycle/feature/module/controllers/audits/state-audit.service';
import { StatesGroupAuditService } from './lifecycle/feature/module/controllers/audits/states-group-audit.service';
import { ConditionService } from './lifecycle/feature/module/controllers/conditions/condition.service';
import { StateActorTemplateService } from './lifecycle/feature/module/controllers/templates/state-actor-template.service';
import { StatesGroupTemplateService } from './lifecycle/feature/module/controllers/templates/states-group-template.service';
import { StateTemplateService } from './lifecycle/feature/module/controllers/templates/state-template.service';
import { LifecycleManagerService } from './lifecycle/feature/module/controllers/lifecycle-manager.service';

export const PROXY_SERVICES = [StateActorAuditService, StateAuditService, StatesGroupAuditService, ConditionService, StateActorTemplateService, StatesGroupTemplateService, StateTemplateService, LifecycleManagerService];