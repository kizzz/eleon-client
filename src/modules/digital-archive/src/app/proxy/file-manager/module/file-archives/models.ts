import type { EntityDto, PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { FileArchiveHierarchyType } from '../../../common/module/constants/file-archive-hierarchy-type.enum';

export interface FileArchiveDto extends EntityDto<string> {
  name?: string;
  rootFolderId?: string;
  physicalRootFolderId?: string;
  fileArchiveHierarchyType: FileArchiveHierarchyType;
  storageProviderId?: string;
  fileEditStorageProviderId?: string;
  storageProviderName?: string;
  isActive: boolean;
  isPersonalizedArchive: boolean;
}

export interface FileArchiveListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
}
