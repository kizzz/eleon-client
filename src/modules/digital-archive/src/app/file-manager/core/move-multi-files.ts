import { FileManagerType, HierarchyFolderDto } from '@eleon/file-manager-proxy';

export interface MoveMultiFiles {
  rootId: string;
  sourceId: Array<string>;
  sourceName: string;
  sourceParentId?: string;
  archiveId: string;
  fileManagerType: FileManagerType;
  folders?: Array<string>;
}
