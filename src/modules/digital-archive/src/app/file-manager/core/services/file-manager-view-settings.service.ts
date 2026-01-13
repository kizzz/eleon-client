import { computed, effect, Injectable, signal } from '@angular/core';
import { FileManagerTab } from '../file-manager-tab.enum';
import { EntryFilterDto, EntryKind, FileStatus } from '@eleon/file-manager-proxy';
import { FileManagerType, FileShareStatus } from '@eleon/file-manager-proxy';
import { FileExplorerView } from '../file-explorer-view.enum';



@Injectable()
export class FileManagerViewSettingsService {

  public readonly listView = signal('list');
  public readonly checkAll = signal<boolean | null>(false);
  public readonly fileManagerType = signal<FileManagerType>(FileManagerType.FileArchive);

  public readonly viewMode = signal<FileExplorerView>(FileExplorerView.Full);
  public readonly readonlyViewMode = computed(() => this.viewMode());

  // public readonly fileManagerType = computed(() => {
  //   switch(this.viewMode()) {
  //     case FileExplorerView.OnlyExplorer:
  //       return FileManagerType.Provider;
  //     default:
  //       return FileManagerType.FileArchive;
  //   }
  // });

  public readonly currentTab = signal<FileManagerTab>(FileManagerTab.FileExplorer);
  public readonly readonlyCurrentTab = computed<FileManagerTab>(() => this.currentTab());

  public readonly currentFolderId = signal<string>(null, {equal: (a, b) => false});
  public readonly readonlyCurrentFolderId = computed<string>(() => this.currentFolderId(), {equal: (a, b) => false});
  
  public get loadingGeneral() { 
    return this.loadingArchive ||
      this.loadingDetails || 
      this.loadingPermissions || 
      this.loadingFolderFilesContent ||
      this.loadingFolderFoldersContent ||
      this.loadingDownloading;
  }

  public loadingArchive = false;
  public loadingDetails = false;
  public loadingPermissions = false;
  public loadingFolderFilesContent = false;
  public loadingFolderFoldersContent = false;
  public loadingDownloading = false;

  get favouriteFolderFilter(): EntryFilterDto {
    return {
      filterByFavourite: true,
      filterByStatus: false,
      fileStatuses: [],
      filterByShareStatus: false,
      fileShareStatuses: [],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.Folder,
    };
  }
  get favouriteFileFilter(): EntryFilterDto {
    return {
      filterByFavourite: true,
      filterByStatus: false,
      fileStatuses: [],
      filterByShareStatus: false,
      fileShareStatuses: [],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.File,
    };
  }
  get trashFolderFilter(): EntryFilterDto {
    return {
      filterByFavourite: false,
      filterByStatus: true,
      fileStatuses: [FileStatus.Trash],
      filterByShareStatus: false,
      fileShareStatuses: [],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.Folder,
    };
  }
  get trashFileFilter(): EntryFilterDto {
    return {
      filterByFavourite: false,
      filterByStatus: true,
      fileStatuses: [FileStatus.Trash],
      filterByShareStatus: false,
      fileShareStatuses: [],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.File,
    };
  }
    get sharedFolderFilter(): EntryFilterDto {
    return {
      filterByFavourite: false,
      filterByStatus: false,
      fileStatuses: [],
      filterByShareStatus: false,
      fileShareStatuses: [],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.Folder,
    };
  }
  get sharedFileFilter(): EntryFilterDto {
    return {
      filterByFavourite: false,
      filterByStatus: false,
      filterByShareStatus: true,
      fileStatuses: [],
      fileShareStatuses: [FileShareStatus.Comment, FileShareStatus.Readonly, FileShareStatus.Modify],
      fileManagerType: this.fileManagerType(),
      kind: EntryKind.File,
    };
  }

  public setCurrentFolderId(id: string) {
    this.currentFolderId.set(id);
    this.checkAll.set(false);
  }

  public reloadCurrentFolder() {
    this.currentFolderId.update(id => id);
    this.checkAll.set(false);
  }
}
