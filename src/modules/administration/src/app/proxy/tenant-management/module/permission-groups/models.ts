import type { GetPermissionListResultDto, ProviderInfoDto } from '../../../volo/abp/permission-management/models';

export interface FeaturePermissionListResultDto extends GetPermissionListResultDto {
  allGrantedByProvider: ProviderInfoDto;
}

export interface PermissionGroup {
  name?: string;
  dynamic: boolean;
  order: number;
}

export interface PermissionGroupCategory {
  name?: string;
  permissionGroups: PermissionGroup[];
}
