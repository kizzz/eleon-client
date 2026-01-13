import type { ClientApplicationPropertyDto } from '../client-applications/models';
import type { ModuleType } from '../../../common/module/constants/module-type.enum';
import type { ServiceHealthStatus } from '../../../common/module/constants/service-health-status.enum';

export interface ApplicationModuleDto {
  id?: string;
  url?: string;
  name?: string;
  pluginName?: string;
  parentId?: string;
  loadLevel?: string;
  orderIndex: number;
  expose?: string;
  properties: ClientApplicationPropertyDto[];
  clientApplicationEntityId?: string;
}

export interface EleoncoreModuleDto {
  id?: string;
  displayName?: string;
  isEnabled: boolean;
  isDefault: boolean;
  path?: string;
  type: ModuleType;
  source?: string;
  isSystem: boolean;
  isHidden: boolean;
  isHealthCheckEnabled: boolean;
  lastHealthCheckStatusDate?: string;
  healthCheckStatusMessage?: string;
  healthCheckStatus: ServiceHealthStatus;
}
