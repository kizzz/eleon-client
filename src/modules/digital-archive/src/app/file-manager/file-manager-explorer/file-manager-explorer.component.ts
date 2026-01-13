import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  effect,
  Input,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArchiveManagerService } from '../core/services/archive-manager.service';
import { FileManagerDetailsService } from '../core/services/file-manager-details.service';
import { FileManagerViewSettingsService } from '../core/services/file-manager-view-settings.service';
import { FileManagerPermissionsService } from '../core/services/file-manager-permisisions.service';
import { FileManagerSelectedContentService } from '../core/services/file-manager-selected-content.service';
import { FileExplorerView } from '../core/file-explorer-view.enum';
import { FileManagerTab } from '../core/file-manager-tab.enum';
import { FileUploadService } from '../core/file-upload.service';
import { FileManagerUploadService } from '../core/services/file-manager-upload.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { FileArchiveHierarchyType, FileManagerType } from '@eleon/file-manager-proxy';

@Component({
  standalone: false,
  selector: 'app-file-manager-explorer',
  templateUrl: './file-manager-explorer.component.html',
  styleUrls: ['./file-manager-explorer.component.scss'],
  providers: [
    ArchiveManagerService,
    FileManagerDetailsService,
    FileManagerPermissionsService,
    FileManagerSelectedContentService,
    FileManagerViewSettingsService,
    FileUploadService,
  ],
})
export class FileManagerExplorerComponent implements OnInit, OnDestroy {
  activeIndex: number = 0;
  selectedFolder = this.fileManagerDetailsService.readonlyCurrentFolderDetails;
  selectedArchive = this.archiveManager.readonlySelectedArchive;
  readonlyViewMode = this.fileManagerViewSettingsService.readonlyViewMode;

  fileExplorerView = FileExplorerView;

  @Input()
  archiveId: string;
  @Input()
  viewMode: FileExplorerView = FileExplorerView.Full;
  @Input()
  defaultTab: FileManagerTab = FileManagerTab.FileExplorer;
  @Input()
  folderSelectionMode: boolean = false;
  @Input()
  selectedFolderId?: string;

  constructor(
    private fileManagerDetailsService: FileManagerDetailsService,
    private fileManagerPermissionsService: FileManagerPermissionsService,
    private fileManagerSelectedContentService: FileManagerSelectedContentService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
    private fileManagerUploadService: FileManagerUploadService,
    private route: ActivatedRoute,
    private archiveManager: ArchiveManagerService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) {
    this.archiveId = this.dialogConfig?.data?.archiveId || this.archiveId;
    this.viewMode = this.dialogConfig?.data?.viewMode || this.viewMode;

    effect(
      () => {
        const selectedArchive = computed(
          () => this.selectedArchive()
        )();
        
        if (selectedArchive?.fileArchiveHierarchyType === FileArchiveHierarchyType.Physical) {
          this.fileManagerViewSettingsService.viewMode.set(FileExplorerView.OnlyExplorer);
        }

        const rootFolderId = selectedArchive?.rootFolderId;
        
        const targetFolderId = this.selectedFolderId || rootFolderId;
        if (targetFolderId) {
          this.fileManagerViewSettingsService.setCurrentFolderId(targetFolderId);
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const currentTab = computed(() =>
        this.fileManagerViewSettingsService.readonlyCurrentTab()
      )();
      switch (currentTab) {
        case FileManagerTab.FileExplorer:
          this.activeIndex = 0;
          break;
        case FileManagerTab.Favourites:
          this.activeIndex = 1;
          break;
        case FileManagerTab.Trash:
          this.activeIndex = 2;
          break;
        case FileManagerTab.FolderExplorer:
        default:
          this.activeIndex = 0;
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.fileManagerSelectedContentService.resetSelectedItems();
    this.archiveManager.setSelectedArchive(null);
    this.fileManagerViewSettingsService.setCurrentFolderId(null);
    this.fileManagerPermissionsService.currentPermissions.set(null);

    if (this.fileManagerUploadService.progressBarOverlay) {
      this.fileManagerUploadService.resetDocumentUploadProcess();
      this.fileManagerUploadService.progressBarOverlay.close();
      this.fileManagerUploadService.progressBarOverlay = null;
    }
  }

  ngOnInit(): void {
    const archiveId =
      this.archiveId || this.route.snapshot.paramMap.get('archiveid');
    this.fileManagerViewSettingsService.viewMode.set(this.viewMode);
    const initialTab = this.folderSelectionMode
      ? FileManagerTab.FolderExplorer
      : this.defaultTab;
    this.fileManagerViewSettingsService.currentTab.set(initialTab);
    if (this.viewMode === FileExplorerView.OnlyExplorer) {
      this.fileManagerViewSettingsService.fileManagerType.set(FileManagerType.Provider);
    }
    this.archiveManager.setSelectedArchive(archiveId);
  }

  onTabChanged(index: number) {
    switch (index) {
      case 0:
        this.fileManagerViewSettingsService.currentTab.set(
          FileManagerTab.FileExplorer
        );
        break;
      case 1:
        this.fileManagerViewSettingsService.currentTab.set(
          FileManagerTab.Favourites
        );
        this.fileManagerViewSettingsService.currentFolderId.set(
          this.selectedArchive()?.rootFolderId
        );
        break;
      case 2:
        this.fileManagerViewSettingsService.currentTab.set(
          FileManagerTab.Trash
        );
        this.fileManagerViewSettingsService.currentFolderId.set(
          this.selectedArchive()?.rootFolderId
        );
        break;
    }

    this.fileManagerSelectedContentService.resetSelectedItems();
  }

  getTitle() {
    const folder = this.selectedFolder();
    if (this.selectedArchive()?.rootFolderId == folder?.id || !folder?.name) {
      return this.selectedArchive()?.name;
    }
    return this.selectedArchive()?.name + ' - ' + folder?.name;
  }
}
