import type { FullAuditedEntityDto } from '@eleon/proxy-utils.lib';
import type { FileStatus } from '../../../common/module/constants/file-status.enum';
import type { FileDto } from '../files/models';

export interface HierarchyFolderDto extends FullAuditedEntityDto<string> {
  name?: string;
  systemFolderName: number;
  parentId?: string;
  level: number;
  physicalFolderId?: string;
  status: FileStatus;
  path?: string;
  isShared: boolean;
  children: HierarchyFolderDto[];
  files: FileDto[];
}
