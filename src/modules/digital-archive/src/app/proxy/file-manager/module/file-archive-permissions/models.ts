import type { FileManagerPermissionType } from '../../../common/module/constants/file-manager-permission-type.enum';
import type { PermissionActorType } from '../../../module-collector/file-manager/module/file-manager/module/domain/shared/constants/permission-actor-type.enum';

export interface FileArchivePermissionDto extends FileArchivePermissionKeyDto {
  allowedPermissions: FileManagerPermissionType[];
  actorDisplayName?: string;
}

export interface FileArchivePermissionKeyDto {
  archiveId?: string;
  folderId?: string;
  actorType: PermissionActorType;
  actorId?: string;
  uniqueKey?: string;
}
