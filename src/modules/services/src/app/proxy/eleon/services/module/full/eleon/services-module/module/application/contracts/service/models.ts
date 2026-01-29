import type { ServiceDto } from '../../../../../../../../../../eleonsoft-module-collector/services-module/services-module/module/application/contracts/service/models';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface FullServiceDto extends ServiceDto {
  modules: ServiceModuleDto[];
  settings: Record<string, string>;
}

export interface GetServicesRequestDto extends PagedAndSortedResultRequestDto {
  filter?: string;
}

export interface ServiceModuleDto {
  id?: string;
  name?: string;
  description?: string;
  serviceId?: string;
  settings: Record<string, string>;
}

export interface UpdateServiceModuleDto {
  name?: string;
  description?: string;
  settings: Record<string, string>;
}

export interface UpdateServiceStatusDto {
  isOnStartup: boolean;
  serviceId?: string;
  serviceName?: string;
  serviceLocation?: string;
  settings: Record<string, string>;
  modules: UpdateServiceModuleDto[];
}
