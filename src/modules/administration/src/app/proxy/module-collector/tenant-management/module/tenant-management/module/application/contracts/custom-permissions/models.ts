import type { CustomPermissionDto, CustomPermissionGroupDto } from '../../../../../../../../tenant-management/module/custom-permissions/models';

export interface CustomPermissionsForMicroserviceDto {
  sourceId?: string;
  groups: CustomPermissionGroupDto[];
  permissions: CustomPermissionDto[];
}
