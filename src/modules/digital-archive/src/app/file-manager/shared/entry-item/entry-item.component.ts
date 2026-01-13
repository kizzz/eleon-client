import { FileManagerSelectedContentService } from '../../core/services/file-manager-selected-content.service';
import {
  Component,
  computed,
  effect,
  Input,
  OnInit,
  ViewChildren,
} from '@angular/core';
import { first } from 'rxjs/operators';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { FileManagerViewSettingsService } from '../../core/services/file-manager-view-settings.service';
import {
  FileArchiveFavouriteService,
  FileArchiveHierarchyType,
  FileManagerType,
  FileService,
} from '@eleon/file-manager-proxy';
import { DialogService } from 'primeng/dynamicdialog';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { FileExternalLinkService } from '@eleon/file-manager-proxy';
import { fileShareIcons } from '../file-share-icons';
import { fileShareSeverities } from '../file-share-severities';
import { FileShareStatus } from '@eleon/file-manager-proxy';
import { Checkbox } from 'primeng/checkbox';
import { FileHistoryComponent } from '../file-history/file-history.component';
import { DocumentViewerService } from '@eleon/primeng-ui.lib';
import { FileShareComponent } from '../file-share/file-share.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FileManagerTab } from '../../core/file-manager-tab.enum';
import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { ArchiveManagerService } from '../../core/services/archive-manager.service';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { isFile, isFolder, getEntryIcon } from '../utils/entry-helpers';
import { Folder } from '../../core/folder';
import { FileDynamicDialogHeaderComponent } from '../../file-manager-explorer/file-dynamic-dialog-header/file-dynamic-dialog-header.component';
import { DialogHeaderService } from '../file-dynamic-dialog-header-service';
import { PermissionManagementComponent } from '../permission-management/permission-management.component';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs'

@Component({
  standalone: false,
  selector: 'app-entry-item',
  templateUrl: './entry-item.component.html',
  styleUrls: ['./entry-item.component.scss'],
})
export class EntryItemComponent implements OnInit {
  @Input()
  entry: FileSystemEntryDto;
  @Input()
  readOnly: boolean = false;

  archiveId = this.archiveManager.readonlySelectedArchiveId;
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  isFileArchiveType = computed(
    () =>
      this.fileManagerViewSettingsService.fileManagerType() ===
      FileManagerType.FileArchive
  );

  isVirtualProviderType = computed(
    () =>
      this.archiveManager.selectedArchive()?.fileArchiveHierarchyType === FileArchiveHierarchyType.Virtual
  );

  fileShareIcons = fileShareIcons;
  fileShareSeverities = fileShareSeverities;
  disabled: boolean = false;
  listView = this.fileManagerViewSettingsService.listView;
  checkboxValue: boolean = false;

  isTrashTab = computed(
    () =>
      this.fileManagerViewSettingsService.readonlyCurrentTab() ===
      FileManagerTab.Trash
  );
  protected sharedStatus = FileShareStatus;

  loadingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  

  constructor(
    public fileManagerDetailsService: FileManagerDetailsService,
    public archiveManager: ArchiveManagerService,
    public fileHelper: FileHelperService,
    public fileManagerSelectedContentService: FileManagerSelectedContentService,
    public messageService: LocalizedMessageService,
    public fileManagerViewSettingsService: FileManagerViewSettingsService,
    public fileService: FileService,
    public dialogService: DialogService,
    public confirmationService: LocalizedConfirmationService,
    public localizationService: ILocalizationService,
    public fileHelperService: FileHelperService,
    public docViewer: DocumentViewerService,
    public fileExternalLinkService: FileExternalLinkService,
    public fileFavouritesService: FileArchiveFavouriteService,
    public documentViewerService: DocumentViewerService,
    private dialogHeaderService: DialogHeaderService,
    private breakpointObserver: BreakpointObserver
  ) {
    effect(() => {
      const checkAll = computed(() =>
        fileManagerViewSettingsService.checkAll()
      )();
      if (checkAll === true) {
        this.checkboxValue = true;
      } else if (checkAll === false) {
        this.checkboxValue = false;
      }
    });
  }

  ngOnInit(): void {
    this.isMobileOrTabletDevice();

    if (!this.fileManagerSelectedContentService.selectedItemsIds) {
      return;
    }

    const isFileEntry = isFile(this.entry);
    this.checkboxValue =
      this.fileManagerSelectedContentService.selectedItemsIds.filter(
        (item) => item.id == this.entry?.id && item.isFile === isFileEntry
      ).length > 0;
  }

  ngAfterViewInit() {}

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }

  isMobileOrTabletDevice() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result => {
      this.disabled = result.matches;
    });
  }

  // File-specific methods
  onDocumentView(entry: FileSystemEntryDto) {
    if (!isFile(entry)) {
      return;
    }

    this.loadingSubject$.next(true);
    this.fileService
      .downloadFileByIdAndIsVersionAndArchiveIdAndType(
        entry.id,
        false,
        this.archiveId(),
        this.fileManagerType()
      )
      .pipe(first())
      .subscribe((result) => {
        this.loadingSubject$.next(false);
        this.documentViewerService.openDocumentViewer(
          result as any,
          entry.name
        );
      });
  }

  downloadDocument(entry: FileSystemEntryDto) {
    if (!isFile(entry)) {
      return;
    }
    this.fileService
      .downloadFileByIdAndIsVersionAndArchiveIdAndType(
        entry.id,
        false,
        this.archiveId(),
        this.fileManagerType()
      )
      .subscribe(
        (event) => {
          this.fileHelper.saveBase64File(event as any, entry.name);
        },
        (error) => {
          this.messageService.error('error while downloading document');
        }
      );
  }

  share(entry: FileSystemEntryDto) {
    if (!isFile(entry)) {
      return;
    }
    this.dialogService.open(FileShareComponent, {
      data: {
        fileId: entry.id,
        archiveId: this.archiveId(),
      },
      header: this.localizationService.instant('FileManager::ShareDocument'),
    });
  }

  download(entry: FileSystemEntryDto) {
    this.downloadDocument(entry);
  }

  openHistory(entry: FileSystemEntryDto) {
    if (!isFile(entry)) {
      return;
    }
    this.dialogService.open(FileHistoryComponent, {
      data: {
        fileId: entry.id,
        archiveId: this.archiveId(),
        header: this.localizationService.instant('FileManager::History'),
        headerIcon: 'fa fa-book',
      },
      header: this.localizationService.instant('FileManager::History'),
      width: '900px',
    });
  }

  // Folder-specific methods
  onFolderClick(entry: FileSystemEntryDto) {
    if (!isFolder(entry)) {
      return;
    }
    this.fileManagerSelectedContentService.resetSelectedItems();
    if (
      this.fileManagerViewSettingsService.currentTab() ===
      FileManagerTab.Favourites
    ) {
      this.fileManagerViewSettingsService.currentTab.set(
        FileManagerTab.FileExplorer
      );
    }
    this.fileManagerViewSettingsService.setCurrentFolderId(entry.id);
  }

  openPermissions(entry: FileSystemEntryDto) {
    if (!isFolder(entry)) {
      return;
    }
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? '95vw' : '600px';
    this.dialogHeaderService.setTitle(
      this.localizationService.instant('FileManager::Permissions:Folder')
    );
    const dialogRef = this.dialogService.open(PermissionManagementComponent, {
      width: width,
      height: '600px',
      baseZIndex: 5000,
      modal: true,
      data: {
        archiveId: this.archiveId(),
        folderId: entry.id,
      },
      templates: {
        header: FileDynamicDialogHeaderComponent,
      },
      styleClass: 'archivePermissionDialog dialog-pb-custom',
    });
  }

  // Shared methods
  addFavourites(entry: FileSystemEntryDto) {
    if (isFile(entry)) {
      this.fileFavouritesService
        .addToFavouritesByFavouriteDto({
          archiveId: this.archiveId(),
          fileId: entry.id,
          folderId: null,
          parentId: entry.parentId ?? entry.folderId,
        })
        .pipe(first())
        .subscribe((result) => {
          if (result) {
            entry.isFavourite = true;
          }
        });
    } else if (isFolder(entry)) {
      this.fileFavouritesService
        .addToFavouritesByFavouriteDto({
          archiveId: this.archiveId(),
          fileId: null,
          folderId: entry.id,
          parentId: entry.parentId ?? entry.folderId,
        })
        .pipe(first())
        .subscribe((result) => {
          if (result) {
            entry.isFavourite = true;
          }
        });
    }
  }

  removeFromFavourites(entry: FileSystemEntryDto) {
    if (isFile(entry)) {
      this.fileFavouritesService
        .removeFromFavouritesByFavouriteDto({
          archiveId: this.archiveId(),
          fileId: entry.id,
          folderId: null,
          parentId: entry.parentId ?? entry.folderId,
        })
        .pipe(first())
        .subscribe((result) => {
          if (result) {
            entry.isFavourite = false;
          }
        });
    } else if (isFolder(entry)) {
      this.fileFavouritesService
        .removeFromFavouritesByFavouriteDto({
          archiveId: this.archiveId(),
          fileId: null,
          folderId: entry.id,
          parentId: entry.parentId ?? entry.folderId,
        })
        .pipe(first())
        .subscribe((result) => {
          if (result) {
            entry.isFavourite = false;
          }
        });
    }
  }

  deleteEntry(entry: FileSystemEntryDto) {
    const isFileEntry = isFile(entry);
    this.confirmationService.confirm(
      this.localizationService.instant('FileManager::DeleteConfirmation'),
      () => {
        this.loadingSubject$.next(true);
        this.fileService
          .deleteEntryByIdAndArchiveIdAndType(
            entry.id,
            this.archiveId(),
            FileManagerType.FileArchive
          )
          .pipe(first())
          .subscribe(
            () => {
              this.loadingSubject$.next(false);
              if (isFileEntry) {
                this.messageService.success(
                  'FileManager::FileDeletedSuccessfully'
                );
              } else {
                this.messageService.success(
                  'FileManager::FolderDeletedSuccessfully'
                );
              }
              this.fileManagerViewSettingsService.reloadCurrentFolder();
            },
            () => {
              this.loadingSubject$.next(false);
              if (isFileEntry) {
                this.messageService.error('FileManager::ErrorDeletingFile');
              } else {
                this.messageService.error('FileManager::ErrorDeletingFolder');
              }
            }
          );
      }
    );
  }

  getEntryIcon(entry: FileSystemEntryDto): string {
    return getEntryIcon(entry);
  }

  public trackById(index: number, entry: FileSystemEntryDto): string {
    return entry.id;
  }

  addOrRemoveContentItem(id: string) {
    if (!this.entry) {
      return;
    }
    this.fileManagerSelectedContentService.addOrRemoveSelectedEntry(this.entry);
    this.fileManagerViewSettingsService.checkAll.set(null);
  }

  // Type guard helpers for template
  isFileEntry(): boolean {
    return isFile(this.entry);
  }

  isFolderEntry(): boolean {
    return isFolder(this.entry);
  }
}
