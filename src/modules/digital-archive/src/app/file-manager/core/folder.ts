import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { FileStatus } from '@eleon/file-manager-proxy';


export class Folder {
  id?: string;
  name?: string;
  parentId?: string;
  physicalFolderId?: string;
  children?: Folder[];
  files?: FileSystemEntryDto[];
  virtualParentId?: string;
  createdDate?: Date;
  isRightClicked?: boolean;
  size?: string;
  status: FileStatus;
}
