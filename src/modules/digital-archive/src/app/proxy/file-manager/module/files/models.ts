import type { EntryKind } from '../constants/entry-kind.enum';
import type { FileManagerType } from '../../../eleonsoft-module-collector/file-manager/module/file-manager/module/domain/shared/constants/file-manager-type.enum';
import type { FileStatus } from '../../../common/module/constants/file-status.enum';
import type { FileShareStatus } from '../../../common/module/constants/file-share-status.enum';
import type { EntityDto, FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface CopyEntryDto {
  entryId?: string;
  destinationParentId?: string;
}

export interface CreateEntryDto {
  kind: EntryKind;
  name?: string;
  parentId?: string;
  extension?: string;
  physicalFolderId?: string;
  isShared: boolean;
}

export interface DownloadAllDto {
  fileIds: string[];
  folders: string[];
  archiveId?: string;
  fileManagerType: FileManagerType;
  parentId?: string;
}

export interface EntryFilterDto {
  archiveId?: string;
  fileManagerType: FileManagerType;
  kind?: EntryKind;
  filterByFavourite: boolean;
  filterByStatus: boolean;
  filterByShareStatus: boolean;
  fileStatuses: FileStatus[];
  fileShareStatuses: FileShareStatus[];
}

export interface FileSourceDto {
  name?: string;
  source?: string;
  type?: string;
  relativePath?: string;
}

export interface FileSystemEntryDto extends FullAuditedEntityDto<string> {
  entryKind: EntryKind;
  sharedStatus: FileShareStatus;
  archiveId?: string;
  name?: string;
  folderId?: string;
  parentId?: string;
  status: FileStatus;
  isFavourite: boolean;
  extension?: string;
  path?: string;
  size?: string;
  thumbnailPath?: string;
  originalPath?: string;
  originalThumbnailPath?: string;
  source: number[];
  lastModifierName?: string;
  physicalFolderId?: string;
  isShared: boolean;
  parent: FileSystemEntryDto;
  children: FileSystemEntryDto[];
  files: FileSystemEntryDto[];
  tenantId?: string;
}

export interface FileUploadDto {
  files: FileSourceDto[];
  archiveId?: string;
  fileManagerType: FileManagerType;
  folderId?: string;
}

export interface GetFileEntriesByParentPagedInput extends PagedAndSortedResultRequestDto {
  folderId?: string;
}

export interface MoveAllEntriesDto {
  entryIds: string[];
  destinationParentId?: string;
}

export interface MoveEntryDto {
  entryId?: string;
  destinationParentId?: string;
}

export interface RenameEntryDto extends EntityDto<string> {
  name?: string;
}

export interface FileDto extends FullAuditedEntityDto<string> {
  sharedStatus: FileShareStatus;
  archiveId?: string;
  name?: string;
  folderId?: string;
  status: FileStatus;
  isFavourite: boolean;
  extension?: string;
  path?: string;
  size?: string;
  thumbnailPath?: string;
  originalPath?: string;
  originalThumbnailPath?: string;
  source: number[];
  lastModifierName?: string;
}
