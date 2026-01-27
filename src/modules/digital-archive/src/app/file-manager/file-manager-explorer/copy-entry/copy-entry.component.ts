import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileService, EntryKind } from '@eleon/file-manager-proxy';
import { CopyEntryDto, FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { HierarchyFolderDto } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Folder } from '../../core/folder';
import { FileManagerViewSettingsService } from '../../core/services/file-manager-view-settings.service';
import { FileManagerType } from '@eleon/file-manager-proxy';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';

export interface CopyEntryData {
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
  selector: 'app-copy-entry',
  templateUrl: './copy-entry.component.html',
  styleUrls: ['./copy-entry.component.scss']
})
export class CopyEntryComponent implements OnInit {

  @Input()
  archiveId: string;

  selectedEntry: FileSystemEntryDto | null = null;
  selectedFolder: Folder;
  folderPaths: HierarchyFolderDto[] = [];
  isLoading = false;

  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig<CopyEntryData>,
    private fileService: FileService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService) {
  }

  get data(): CopyEntryData {
    return this.config.data;
  }

  ngOnInit(): void {
    if (!this.data?.root) {
      return;
    }
    this.archiveId = this.data.archiveId;
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
    this.fileService.getEntriesByParentIdByParentIdAndArchiveIdAndKindAndFileStatusesAndTypeAndRecursive(parentId, this.archiveId, EntryKind.Folder, null, this.fileManagerType(), false)
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

  onCopied() {
    if (!this.selectedFolder?.id) {
      this.messageService.error('FileManager::Error:InvalidDestination');
      return;
    }

    if (this.data.sourceParentId === this.selectedFolder.physicalFolderId) {
      this.messageService.error('FileManager::Error:SameFolderAndDestination');
      return;
    }

    this.isLoading = true;

    if (this.data.entries && this.data.entries.length > 0) {
      // Multiple entries - copy each one
      const copyPromises = this.data.entries.map(entry => {
        if (entry.id) {
          // Copy entry (file or folder)
          const copyDto: CopyEntryDto = {
            entryId: entry.id,
            destinationParentId: this.selectedFolder.id
          };
          return this.fileService.copyEntryByDtoAndArchiveIdAndType(copyDto, this.archiveId, this.fileManagerType()).toPromise();
        }
        return Promise.resolve(true);
      });

      Promise.all(copyPromises)
        .then(() => {
          this.isLoading = false;
          this.dialogRef.close({ flag: true });
        })
        .catch((err) => {
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
        });
    } else {
      // Single entry
      const entry = this.data.entry;
      if (entry?.id) {
        const copyDto: CopyEntryDto = {
          entryId: entry.id,
          destinationParentId: this.selectedFolder.id
        };
        this.fileService.copyEntryByDtoAndArchiveIdAndType(copyDto, this.archiveId, this.fileManagerType())
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
  }

  getPath(id: string) {
    this.fileService.getEntryParentsByIdByIdAndArchiveIdAndType(id, this.archiveId, this.fileManagerType())
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
      this.getPath(folderId);
    }
  }
}

