import type { ClientApplicationFrameworkType } from '../../../common/module/constants/client-application-framework-type.enum';
import type { ClientApplicationStyleType } from '../../../common/module/constants/client-application-style-type.enum';
import type { ClientApplicationType } from '../../../common/module/constants/client-application-type.enum';
import type { ErrorHandlingLevel } from '../../../module-collector/commons/module/proxy/constants/error-handling-level.enum';
import type { ApplicationType } from '../../../module-collector/commons/module/proxy/constants/application-type.enum';
import type { ApplicationModuleDto, EleoncoreModuleDto } from '../microservices/models';

export interface ClientApplicationDto {
  id?: string;
  name?: string;
  path?: string;
  source?: string;
  isEnabled: boolean;
  isDefault: boolean;
  headString?: string;
  icon?: string;
  frameworkType: ClientApplicationFrameworkType;
  styleType: ClientApplicationStyleType;
  clientApplicationType: ClientApplicationType;
  errorHandlingLevel: ErrorHandlingLevel;
  useDedicatedDatabase: boolean;
  isSystem: boolean;
  isAuthenticationRequired: boolean;
  requiredPolicy?: string;
  properties: ClientApplicationPropertyDto[];
  appType: ApplicationType;
  parentId?: string;
  expose?: string;
  loadLevel?: string;
  orderIndex: number;
}

export interface ClientApplicationPropertyDto {
  key?: string;
  value?: string;
  type?: string;
  level?: string;
}

export interface CreateClientApplicationDto {
  id?: string;
  name?: string;
  source?: string;
  isEnabled: boolean;
  isDefault: boolean;
  isAuthenticationRequired: boolean;
  requiredPolicy?: string;
  frameworkType: ClientApplicationFrameworkType;
  styleType: ClientApplicationStyleType;
  clientApplicationType: ClientApplicationType;
  tenantId?: string;
  path?: string;
  icon?: string;
  properties: ClientApplicationPropertyDto[];
  parentId?: string;
  appType: ApplicationType;
}

export interface FullClientApplicationDto extends ClientApplicationDto {
  modules: ApplicationModuleDto[];
}

export interface ModuleSettingsDto {
  tenantId?: string;
  siteId?: string;
  clientApplications: FullClientApplicationDto[];
  modules: EleoncoreModuleDto[];
}

export interface UpdateClientApplicationDto {
  name?: string;
  path?: string;
  source?: string;
  isEnabled: boolean;
  isAuthenticationRequired: boolean;
  requiredPolicy?: string;
  frameworkType: ClientApplicationFrameworkType;
  styleType: ClientApplicationStyleType;
  clientApplicationType: ClientApplicationType;
  icon?: string;
  properties: ClientApplicationPropertyDto[];
  isDefault: boolean;
}
