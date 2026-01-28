import type { ApplicationModuleDto } from '../microservices/models';
import type { ClientApplicationPropertyDto } from '../client-applications/models';
import type { LocationType } from '../../../module-collector/sites-management/module/sites-management/module/domain/managers/locations/location-type.enum';
import type { SiteType } from '../../../module-collector/sites-management/module/sites-management/module/domain/managers/locations/site-type.enum';
import type { VirtualFolderType } from '../../../common/module/constants/virtual-folder-type.enum';
import type { ClientApplicationFrameworkType } from '../../../common/module/constants/client-application-framework-type.enum';
import type { ClientApplicationStyleType } from '../../../common/module/constants/client-application-style-type.enum';

export interface FullLocationDto extends LocationDto {
  modules: ApplicationModuleDto[];
  properties: ClientApplicationPropertyDto[];
}

export interface LocationDto {
  id?: string;
  locationType: LocationType;
  siteType: SiteType;
  name?: string;
  hostname?: string;
  path?: string;
  parentId?: string;
  isEnabled: boolean;
  apiKeyId?: string;
  destinationPath?: string;
  source?: string;
  sourceId?: string;
  virtualFolderType: VirtualFolderType;
  frameworkType: ClientApplicationFrameworkType;
  styleType: ClientApplicationStyleType;
  isDefault: boolean;
  isSystem: boolean;
}
