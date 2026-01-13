import { Component, OnInit } from '@angular/core';
import { MoveAllEntriesDto, FileSystemEntryDto, EntryKind } from '@eleon/file-manager-proxy';
import { HierarchyFolderDto } from '@eleon/file-manager-proxy';
import { FileService } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { MoveMultiFiles } from '../../core/move-multi-files';
import { Folder } from '../../core/folder';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { isFolder } from '../../shared/utils/entry-helpers';

@Component({
  standalone: false,
  selector: 'app-file-move-all',
  templateUrl: './file-move-all.component.html',
  styleUrls: ['./file-move-all.component.scss']
})
export class FileMoveAllComponent implements OnInit {
  get archiveId() {
    return this.config.data.archiveId;
  }
  get fileManagerType() {
    return this.config.data.fileManagerType;
  }

  selectedFolderId = '';
  folderPaths: HierarchyFolderDto[] = [];
  currentFolders: Folder[] = [];

  get data() {
    return this.config.data;
  }

  isLoading = false;

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig<MoveMultiFiles>,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
  ) {
  }

  ngOnInit(): void {
    this.selectedFolderId = this.data.rootId;
    this.getChildFolders(this.data.rootId);
    this.getPath(this.data.rootId);
  }

  onFolderClick(parent: FileSystemEntryDto | Folder) {
    const folderEntry = 'entryKind' in parent ? parent as FileSystemEntryDto : null;
    if (folderEntry && !isFolder(folderEntry)) {
      return; // Only folders can be selected
    }
    const folderId = folderEntry?.id ?? (parent as Folder)?.id;
    if (folderId) {
      this.selectedFolderId = folderId;
      this.getChildFolders(folderId);
      this.getPath(folderId);
    }
  }

  getChildFolders(parentId: string) {
    this.fileService.getEntriesByParentIdByParentIdAndArchiveIdAndKindAndFileStatusesAndTypeAndRecursive(parentId, this.archiveId, EntryKind.Folder, null, this.fileManagerType, false)
      .subscribe((childs: FileSystemEntryDto[]) => {
        this.currentFolders = structuredClone(childs as unknown as Folder[]);
        this.getPath(parentId);
      });
  }
  onCancel() {
    this.dialogRef.close({ flag: false });
  }

  onMoveAll() {
    if (this.data.sourceParentId === this.selectedFolderId) {
      this.messageService.error('FileManager::Error:SameFolderAndDestination');
      return;
    }
    this.isLoading = true;
    // Combine fileIds and folders into unified entryIds array
    const entryIds: string[] = [];
    if (this.data.sourceId && Array.isArray(this.data.sourceId)) {
      entryIds.push(...this.data.sourceId);
    }
    if (this.data.folders && Array.isArray(this.data.folders)) {
      entryIds.push(...this.data.folders);
    }
    
    const moveAllEntries: MoveAllEntriesDto = {
      entryIds: entryIds,
      destinationParentId: this.selectedFolderId
    };
    this.fileService.moveAllEntriesByDtoAndArchiveIdAndType(moveAllEntries, this.archiveId, this.fileManagerType)
      .subscribe(() => {
        this.isLoading = false;
        this.dialogRef.close({ flag: true });
      }, () => this.isLoading = false);
  }

  getPath(id) {
    this.fileService.getEntryParentsByIdByIdAndArchiveIdAndType(id, this.archiveId, this.fileManagerType)
      .subscribe((path: HierarchyFolderDto[]) => {
        this.folderPaths = path;
      });
  }

  onPathClick(folder: HierarchyFolderDto | FileSystemEntryDto) {
    const folderId = 'id' in folder ? folder.id : (folder as HierarchyFolderDto).id;
    if (folderId) {
      this.getChildFolders(folderId);
    }
  }

}
