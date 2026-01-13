import { FileStatus } from '@eleon/file-manager-proxy';

export class DocumentFolderId {
  documentId?: string;
  folderId?: string;
  documentName?: string;
  folderName:string;
  status: FileStatus;
}
