import { FileManagerViewSettingsService } from './file-manager-view-settings.service';
import { computed, effect, Injectable, signal } from '@angular/core';
import { ArchiveManagerService } from './archive-manager.service';
import { first, map, Observable } from 'rxjs';
import { FileSystemEntryDto, EntryKind, GetFileEntriesByParentPagedInput, FileManagerType } from '@eleon/file-manager-proxy';
import { FileService } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { FileStatus } from '@eleon/file-manager-proxy';
import { FileManagerTab } from '../file-manager-tab.enum';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';
import { PagedResultDto } from '@eleon/proxy-utils.lib';
import { FileExplorerView } from '../file-explorer-view.enum';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

@Injectable()
export class FileManagerDetailsService {
  
  public readonly currentFolderDetails = signal<FileSystemEntryDto>(null);
  public readonly currentPagedEntries = signal<FileSystemEntryDto[]>([]);
  public readonly readonlyCurrentFolderDetails = computed<FileSystemEntryDto>(() => this.currentFolderDetails());

  public readonly readonlyCurrentFolderFilenames = computed<string[]>(() => 
    this.currentFolderDetails()?.files?.filter(isFile).map((file: FileSystemEntryDto) => file.name) ?? []
  );

  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;
  
  constructor(
    private fileService: FileService,
    private archiveManagerService : ArchiveManagerService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
  ) {
      effect(() => {
        const folderId = this.fileManagerViewSettingsService.readonlyCurrentFolderId() || this.archiveManagerService.readonlySelectedArchive()?.rootFolderId;
        if (!folderId) {
          return;
        }
        const viewMode = this.fileManagerViewSettingsService.readonlyViewMode();
        if (viewMode ===  FileExplorerView.OnlyExplorer) {
          return;
        }

        let fileStatuses : FileStatus[];

        switch (this.fileManagerViewSettingsService.readonlyCurrentTab()) {
          case FileManagerTab.FileExplorer:
          case FileManagerTab.Favourites:
          case FileManagerTab.FolderExplorer:
            fileStatuses = [FileStatus.Active];
            break;
          case FileManagerTab.Trash:
            fileStatuses = [FileStatus.Trash];
            break;
          default:
            fileStatuses = [FileStatus.Active];
            break;
        }

        this.fileManagerViewSettingsService.loadingDetails = true;
        
        this.fileService
          .getEntryByIdByIdAndArchiveIdAndType(folderId, this.archiveManagerService.readonlySelectedArchiveId(), this.fileManagerType())
          .pipe(first())
          .subscribe((folderDetails: FileSystemEntryDto) => {
            if (folderDetails) {
              this.currentFolderDetails.set(folderDetails);
            } 
            else {
              this.messageService.warn('FileManager::NotFound') // TODO explicit return from backend don't have permission info
            }
          },
          err => {
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
            this.currentFolderDetails.set(null);
          },
          () => {
            this.fileManagerViewSettingsService.loadingDetails = false;
          }
        );
    });
  }

  public renameFolder(id: string, value: string) {
    if (!id || !value) {
      return;
    }
    // Also update in current folder details if it's the renamed folder
    this.currentFolderDetails.update(folder => {
      if (folder?.id === id) {
        return {...folder, name: value};
      }
      return folder;
    });
    this.fileManagerViewSettingsService.reloadCurrentFolder();
  }

  public renameFile(id: string, value: string) {
    if (!id || !value) {
      return;
    }
    this.fileManagerViewSettingsService.reloadCurrentFolder();
  }

  public renameEntry(entry: FileSystemEntryDto, newName: string) {
    if (!entry?.id || !newName) {
      return;
    }
    if (isFile(entry)) {
      this.renameFile(entry.id, newName);
    } else {
      this.renameFolder(entry.id, newName);
    }
  }

  public setCurrentFolderDetails(value: FileSystemEntryDto) {
    if (value && !isFolder(value)) {
      // Only folders can be current folder details
      return;
    }
    this.currentFolderDetails.set(value);
  }

  public updateCurrentFolderFolders(value: FileSystemEntryDto[]) {
    this.currentFolderDetails.update(folder => {
      return {...folder, children: value};
    });
  }

  public setCurrentPagedEntries(entries: FileSystemEntryDto[]) {
    this.currentPagedEntries.set(entries);
  }

  public getEntriesByParentIdPaged(
    parentId: string,
    archiveId: string,
    kind: EntryKind | null,
    fileStatuses: FileStatus[],
    type: FileManagerType,
    skipCount: number,
    maxResultCount: number,
    sorting?: string,
    search?: string,
    recursive: boolean = false
  ): Observable<PagedResult<FileSystemEntryDto>> {
    const input: GetFileEntriesByParentPagedInput = {
      folderId: parentId,
      skipCount: skipCount,
      maxResultCount: maxResultCount,
      sorting: sorting
    };

    return this.fileService
      .getEntriesByParentIdPagedByInputAndArchiveIdAndKindAndFileStatusesAndTypeAndRecursive(
        input,
        archiveId,
        kind,
        fileStatuses,
        type,
        recursive
      )
      .pipe(
        map((result: PagedResultDto<FileSystemEntryDto>) => ({
          items: result.items ?? [],
          totalCount: result.totalCount ?? 0
        }))
      );
  }
}
