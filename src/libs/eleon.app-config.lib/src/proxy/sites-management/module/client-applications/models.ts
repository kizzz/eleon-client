import type { ClientApplicationFrameworkType } from '../../../common/module/constants/client-application-framework-type.enum';
import type { ClientApplicationStyleType } from '../../../common/module/constants/client-application-style-type.enum';
import type { ClientApplicationType } from '../../../common/module/constants/client-application-type.enum';
import type { ErrorHandlingLevel } from '../../../module-collector/commons/module/proxy/constants/error-handling-level.enum';
import type { ApplicationType } from '../../../module-collector/commons/module/proxy/constants/application-type.enum';

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
