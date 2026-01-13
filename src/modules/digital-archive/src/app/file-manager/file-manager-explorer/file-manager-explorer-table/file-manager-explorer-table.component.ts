import { FileManagerSelectedContentService } from '../../core/services/file-manager-selected-content.service';
import { ArchiveManagerService } from '../../core/services/archive-manager.service';
import { Component, HostListener, Input, OnInit, computed, signal, effect } from '@angular/core';
import { FileManagerViewSettingsService } from '../../core/services/file-manager-view-settings.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AddFolderComponent } from '../add-folder/add-folder.component';
import { FileUploadService } from '../../core/file-upload.service';
import {
  FileSystemEntryDto,
  FileService,
  MoveEntryDto,
  EntryKind,
  FileStatus,
} from '@eleon/file-manager-proxy';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';
import { Folder } from '../../core/folder';
import { DocumentViewerService } from '@eleon/primeng-ui.lib';
import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { FileManagerTab } from '../../core/file-manager-tab.enum';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { LazyLoadEvent } from 'primeng/api';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-file-manager-explorer-table',
  templateUrl: './file-manager-explorer-table.component.html',
  styleUrls: ['./file-manager-explorer-table.component.scss']
})
export class FileManagerExplorerTableComponent implements OnInit {
  // Pagination state
  skipCount = signal<number>(0);
  maxResultCount = signal<number>(50);
  totalCount = signal<number>(0);
  loading = signal<boolean>(false);
  sorting = signal<string | undefined>(undefined);
  search = signal<string | undefined>(undefined);
  
  // Paged entries from service
  private _pagedEntries = signal<FileSystemEntryDto[]>([]);
  
  // Merged entries array with folders first, then files (applies client-side filters)
  private _entries = computed(() => {
    const entries = this._pagedEntries();
    if (!entries || entries.length === 0) return [];
    
    // Apply filters based on current tab
    const fileFilter = this.fileFilter();
    const folderFilter = this.folderFilter();
    
    let filtered = entries;
    
    // Filter by favourite if needed
    const folders = filtered.filter(isFolder);
    const files = filtered.filter(isFile);
    
    let filteredFolders = folders;
    let filteredFiles = files;
    
    if (folderFilter.filterByFavourite) {
      filteredFolders = filteredFolders.filter(f => f.isFavourite);
    }
    if (fileFilter.filterByFavourite) {
      filteredFiles = filteredFiles.filter(f => f.isFavourite);
    }
    
    // Return folders first, then files
    return [...filteredFolders, ...filteredFiles];
  });

  private fileFilter = computed(() => {
    switch (this.fileManagerViewSettingsService.readonlyCurrentTab()) {
      case FileManagerTab.FileExplorer:
        return this.fileManagerViewSettingsService.sharedFileFilter;
      case FileManagerTab.Favourites: 
        return this.fileManagerViewSettingsService.favouriteFileFilter;
      case FileManagerTab.Trash:
        return this.fileManagerViewSettingsService.trashFileFilter;
      case FileManagerTab.FolderExplorer:
        return this.fileManagerViewSettingsService.sharedFileFilter;
    }
  });
  
  private folderFilter = computed(() => {
    switch (this.fileManagerViewSettingsService.readonlyCurrentTab()) {
      case FileManagerTab.FileExplorer:
        return this.fileManagerViewSettingsService.sharedFolderFilter;
      case FileManagerTab.Favourites: 
        return this.fileManagerViewSettingsService.favouriteFolderFilter;
      case FileManagerTab.Trash:
        return this.fileManagerViewSettingsService.trashFolderFilter;
      case FileManagerTab.FolderExplorer:
        return this.fileManagerViewSettingsService.sharedFolderFilter;
    }
  });
  
  // Computed properties for backward compatibility
  private _files = computed(() => this._entries().filter(isFile));
  private _folders = computed(() => this._entries().filter(isFolder));

  isFavouriteTable = computed(() => this.fileManagerViewSettingsService.readonlyCurrentTab() === FileManagerTab.Favourites);
  isTrashTab = computed(() => this.fileManagerViewSettingsService.readonlyCurrentTab() === FileManagerTab.Trash);

  get isWriteAllowed() {
    return this.fileManagerViewSettingsService.readonlyCurrentTab() === FileManagerTab.FileExplorer;
  }

  @Input()
  selectedFolderId = '';

  @Input()
  selectedArchiveId = '';

  @Input()
  folderSelectionMode = false;

  selectedArchive = this.archiveManager.readonlySelectedArchive;
  currentFolderDetails = this.fileManagerDetailsService.readonlyCurrentFolderDetails;
  currentFolderId = this.fileManagerViewSettingsService.readonlyCurrentFolderId;
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  sortFilters = signal<any>(null);
  
  // Sorted entries with folders first, then files (client-side sorting only for folders-first logic)
  sortedEntries = computed(() => {
    let entries = this._entries();
    // Server-side sorting handles most sorting, but we still ensure folders come first
    const folders = entries.filter(isFolder);
    const files = entries.filter(isFile);
    return [...folders, ...files];
  });
  
  // Computed properties for backward compatibility
  sortedFiles = computed(() => this.sortedEntries().filter(isFile));
  sortedFolders = computed(() => this.sortedEntries().filter(isFolder));

  listView = this.fileManagerViewSettingsService.listView; 
  isMobileDevice = false;

  constructor(
    private archiveManager: ArchiveManagerService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
    private dialogService: DialogService,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
    private documentViewerService: DocumentViewerService,
    private fileUploadService: FileUploadService,
    private localizationService: ILocalizationService,
    private fileManagerDetailsService: FileManagerDetailsService,
    private fileManagerSelectedContentService: FileManagerSelectedContentService
  ) {
    this.isMobileDevice = window.innerWidth <= 576;
    
    // Reset pagination when folder changes
    effect(() => {
      const folderId = this.currentFolderId();
      if (folderId) {
        this.skipCount.set(0);
        this.loadPage();
      }
    }, {allowSignalWrites: true});
  }

  ngOnInit(): void {
    if (this.selectedArchiveId) {
      this.archiveManager.setSelectedArchive(this.selectedArchiveId);
    }
    // Load initial page
    this.loadPage();
  }
  
  private getFileStatuses(): FileStatus[] {
    switch (this.fileManagerViewSettingsService.readonlyCurrentTab()) {
      case FileManagerTab.FileExplorer:
      case FileManagerTab.Favourites:
      case FileManagerTab.FolderExplorer:
        return [FileStatus.Active];
      case FileManagerTab.Trash:
        return [FileStatus.Trash];
      default:
        return [FileStatus.Active];
    }
  }
  
  private buildSortingString(sortField?: string, sortOrder?: number): string | undefined {
    if (!sortField) return undefined;
    const order = sortOrder === 1 ? 'asc' : 'desc';
    return `${sortField} ${order}`;
  }
  
  loadPage(): void {
    const folderId = this.currentFolderId() || this.archiveManager.readonlySelectedArchive()?.rootFolderId;
    if (!folderId) {
      this._pagedEntries.set([]);
      this.totalCount.set(0);
      return;
    }
    
    this.loading.set(true);
    const archiveId = this.archiveManager.readonlySelectedArchiveId();
    const kind: EntryKind | null = null; // null means both files and folders
    const fileStatuses = this.getFileStatuses();
    const type = this.fileManagerType();
    
    this.fileManagerDetailsService
      .getEntriesByParentIdPaged(
        folderId,
        archiveId,
        kind,
        fileStatuses,
        type,
        this.skipCount(),
        this.maxResultCount(),
        this.sorting(),
        this.search(),
        this.isTrashTab()
      )
      .subscribe({
        next: (result) => {
          this._pagedEntries.set(result.items);
          this.totalCount.set(result.totalCount);
          this.loading.set(false);
          
          // Edge case: if page is empty and we're not on first page, go back one page
          if (result.items.length === 0 && this.skipCount() > 0) {
            this.skipCount.set(Math.max(0, this.skipCount() - this.maxResultCount()));
            this.loadPage();
          }
        },
        error: (err) => {
          this._pagedEntries.set([]);
          this.totalCount.set(0);
          this.loading.set(false);
        }
      });
  }
  
  onLazyLoad(event: LazyLoadEvent): void {
    this.skipCount.set(event.first ?? 0);
    if (event.rows) {
      this.maxResultCount.set(event.rows);
    }
    
    // Build sorting string from PrimeNG event
    this.sorting.set(this.buildSortingString(event.sortField, event.sortOrder));
    
    this.loadPage();
  }

  isFile(entry: FileSystemEntryDto): boolean {
    return isFile(entry);
  }

  isFolder(entry: FileSystemEntryDto): boolean {
    return isFolder(entry);
  }

  sortData(sortFilters: any) {
    this.sortFilters.set(sortFilters);
    // Trigger server-side sorting via lazy load
    if (sortFilters) {
      const lazyEvent: LazyLoadEvent = {
        first: this.skipCount(),
        rows: this.maxResultCount(),
        sortField: sortFilters.field,
        sortOrder: sortFilters.order
      };
      this.onLazyLoad(lazyEvent);
    }
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  setListView(view: string) {
    this.fileManagerViewSettingsService.listView.set(view);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.fileManagerSelectedContentService.resetSelectedItems();
    this.fileManagerViewSettingsService.setCurrentFolderId(this.currentFolderDetails().parentId);
  }

  addFolder(): void {
    const dialogRef = this.dialogService.open(AddFolderComponent, {
      width: '400px',
      header: this.localizationService.instant('FileManager::AddFolder'),
      data: {
        archiveId: this.selectedArchive()?.id,
        fileManagerType: this.fileManagerType(),
        folder: this.currentFolderDetails(),
      },
    });
    dialogRef.onClose.subscribe(() => {
      this.fileManagerViewSettingsService.reloadCurrentFolder();
    })
  }

  drop(event: CdkDragDrop<Folder | FileSystemEntryDto>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const source = event.previousContainer.data;
    const container = event.container.data;
    
    if (!source || !container || !source.id || !container.id) {
      return;
    }

    // Prevent dropping on self
    if (source.id === container.id) {
      return;
    }

    // Validate drop target is a folder
    const containerEntry = 'entryKind' in container ? container as FileSystemEntryDto : null;
    if (containerEntry && !isFolder(containerEntry)) {
      return; // Can only drop on folders
    }

    // Check if source is FileSystemEntryDto (has entryKind property)
    const sourceEntry = 'entryKind' in source ? source as FileSystemEntryDto : null;
    
    if (!sourceEntry) {
      // Legacy Folder type - handle if needed
      if (!('entryKind' in source)) {
        this.checkSharedFolder(source as Folder).then((folder: Folder) => {
          const moveEntry: MoveEntryDto = {
            entryId: folder.id ?? '',
            destinationParentId: container.id
          };
          this.fileService.moveEntryByDtoAndArchiveIdAndType(moveEntry, this.selectedArchive().id, this.fileManagerType())
            .subscribe(() => {
              this.messageService.success('FileManager::FolderMoved:Success');
              this.fileManagerViewSettingsService.reloadCurrentFolder();
            });
        });
      }
      return;
    }

    // Use unified move API
    if (isFile(sourceEntry)) {
      const moveDto: MoveEntryDto = {
        entryId: sourceEntry.id,
        destinationParentId: container.id
      };
      this.fileService.moveEntryByDtoAndArchiveIdAndType(moveDto, this.selectedArchive().id, this.fileManagerType())
        .subscribe(() => {
          this.messageService.success('FileManager::FileMoved:Success');
          this.fileManagerViewSettingsService.reloadCurrentFolder();
        });
    } else if (isFolder(sourceEntry)) {
      const moveDto: MoveEntryDto = {
        entryId: sourceEntry.id,
        destinationParentId: container.id
      };
      this.fileService.moveEntryByDtoAndArchiveIdAndType(moveDto, this.selectedArchive().id, this.fileManagerType())
        .subscribe(() => {
          this.messageService.success('FileManager::FolderMoved:Success');
          this.fileManagerViewSettingsService.reloadCurrentFolder();
        });
    }
  }
  
  checkSharedFolder(folder: Folder) {
    return new Promise<Folder>((resolve) => {
      resolve(folder);
    });
  }

  onFolderUploadTempEvent(event: any) {
    if(event) this.fileManagerViewSettingsService.setCurrentFolderId(this.currentFolderDetails()?.id);
  }

  fileEvent($event: Event) {
    const target = $event?.target as HTMLInputElement;
    const files = target?.files ? Array.from(target.files) : null;
    this.fileUploadService.upload(files, this.currentFolderDetails()?.id, this.selectedArchiveId);
  }

  isMainChecked() {
    return this.fileManagerViewSettingsService.checkAll() === true;
  }

  mainCheckOrUncheck(event: { checked: boolean }) {
    this.fileManagerViewSettingsService.checkAll.set(event.checked);
  }

  getEmptyTableMessage() {
    const tab = this.folderSelectionMode
      ? FileManagerTab.FileExplorer
      : this.fileManagerViewSettingsService.readonlyCurrentTab();
    return `FileManager::TabEmpty:${FileManagerTab[tab]}`;
  }

  trackById(index: number, entry: FileSystemEntryDto): string {
    return entry.id;
  }
}
