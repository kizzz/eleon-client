import type { CustomPermissionDto, CustomPermissionGroupDto } from '../../../../../../../../sites-management/module/custom-permissions/models';

export interface CustomPermissionsForMicroserviceDto {
  groups: CustomPermissionGroupDto[];
  permissions: CustomPermissionDto[];
}
