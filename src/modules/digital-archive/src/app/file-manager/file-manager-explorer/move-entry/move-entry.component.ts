import { Component, Input, OnInit } from '@angular/core';
import {
  FileManagerType,
  MoveEntryDto,
  MoveAllEntriesDto,
  EntryKind,
} from '@eleon/file-manager-proxy';
import { FileSystemEntryDto, HierarchyFolderDto } from '@eleon/file-manager-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileService } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Folder } from '../../core/folder';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';

export interface MoveEntryData {
  root: Folder;
  sourceId: string;
  sourceName: string;
  sourceParentId?: string;
  archiveId: string;
  fileManagerType: FileManagerType;
  entry?: FileSystemEntryDto;
  entries?: FileSystemEntryDto[];
}

@Component({
  standalone: false,
  selector: 'app-move-entry',
  templateUrl: './move-entry.component.html',
  styleUrls: ['./move-entry.component.scss']
})
export class MoveEntryComponent implements OnInit {

  @Input()
  archiveId: string;
  @Input()
  fileManagerType: FileManagerType = FileManagerType.FileArchive;

  selectedEntry: FileSystemEntryDto | null = null;
  selectedFolder: Folder;
  folderPaths: HierarchyFolderDto[] = [];
  isLoading = false;

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig<MoveEntryData>,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService) {
  }

  get data(): MoveEntryData {
    return this.config.data;
  }

  ngOnInit(): void {
    if (!this.data?.root) {
      return;
    }
    this.archiveId = this.data.archiveId;
    this.fileManagerType = this.data.fileManagerType;
    this.selectedFolder = structuredClone(this.data.root);
    this.getChildFolders(this.data.root.id);
    this.getPath(this.data.root.id);
    this.selectedEntry = this.data.entry || (this.data.entries && this.data.entries.length > 0 ? this.data.entries[0] : null);
  }

  onFolderClick(parent: FileSystemEntryDto | Folder) {
    const folderEntry = 'entryKind' in parent ? parent : null;
    if (folderEntry && !isFolder(folderEntry)) {
      return;
    }
    const folder = folderEntry || (parent as Folder);
    this.selectedFolder = structuredClone(folder as unknown as Folder);
    this.getChildFolders(folder.id);
    this.getPath(folder.id);
  }

  getChildFolders(parentId: string) {
    this.fileService.getEntriesByParentIdByParentIdAndArchiveIdAndKindAndFileStatusesAndTypeAndRecursive(parentId, this.archiveId, EntryKind.Folder, null, this.fileManagerType, false)
      .subscribe({
        next: (childs: FileSystemEntryDto[]) => {
          this.selectedFolder.children = structuredClone(childs as unknown as Folder[]);
        },
        error: (err) => {
          try {
            const message = JSON.parse(err?.message)?.error?.message;
            if (message) {
              this.messageService.error(message);
            } else {
              this.messageService.error('FileManager::NoErrorMessage');
            }
          } catch {
            this.messageService.error('FileManager::NoErrorMessage');
          }
        }
      });
  }
  
  onCancel() {
    this.dialogRef.close({ flag: false });
  }

  onMoved() {
    if (this.data.sourceParentId === this.selectedFolder.physicalFolderId) {
      this.messageService.error('FileManager::Error:SameFolderAndDestination');
      return;
    }

    this.isLoading = true;

    if (this.data.entries && this.data.entries.length > 0) {
      // Multiple entries
      const entryIds: string[] = [];

      this.data.entries.forEach(entry => {
        if (entry.id) {
          entryIds.push(entry.id);
        }
      });

      const moveAll: MoveAllEntriesDto = {
        entryIds: entryIds,
        destinationParentId: this.selectedFolder.id
      };

      this.fileService.moveAllEntriesByDtoAndArchiveIdAndType(moveAll, this.archiveId, this.fileManagerType)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close({ flag: true });
          },
          error: (err) => {
            try {
              const message = JSON.parse(err?.message)?.error?.message;
              if (message) {
                this.messageService.error(message);
              } else {
                this.messageService.error('FileManager::NoErrorMessage');
              }
            } catch {
              this.messageService.error('FileManager::NoErrorMessage');
            }
            this.isLoading = false;
          }
        });
    } else {
      // Single entry
      const moveEntry: MoveEntryDto = {
        entryId: this.data.sourceId,
        destinationParentId: this.selectedFolder.id
      };
      this.fileService.moveEntryByDtoAndArchiveIdAndType(moveEntry, this.archiveId, this.fileManagerType)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close({ flag: true });
          },
          error: (err) => {
            try {
              const message = JSON.parse(err?.message)?.error?.message;
              if (message) {
                this.messageService.error(message);
              } else {
                this.messageService.error('FileManager::NoErrorMessage');
              }
            } catch {
              this.messageService.error('FileManager::NoErrorMessage');
            }
            this.isLoading = false;
          }
        });
    }
  }

  getPath(id: string) {
    this.fileService.getEntryParentsByIdByIdAndArchiveIdAndType(id, this.archiveId, this.fileManagerType)
      .subscribe({
        next: (path: HierarchyFolderDto[]) => {
          this.folderPaths = path;
        },
        error: (err) => {
          try {
            const message = JSON.parse(err?.message)?.error?.message;
            if (message) {
              this.messageService.error(message);
            } else {
              this.messageService.error('FileManager::NoErrorMessage');
            }
          } catch {
            this.messageService.error('FileManager::NoErrorMessage');
          }
        }
      });
  }

  onPathClick(folder: HierarchyFolderDto | FileSystemEntryDto) {
    const folderId = 'id' in folder ? folder.id : (folder as HierarchyFolderDto).id;
    if (folderId) {
      this.getChildFolders(folderId);
    }
  }
}

