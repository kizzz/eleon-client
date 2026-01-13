import { FileManagerSelectedContentService } from '../../core/services/file-manager-selected-content.service';
import { Component, computed } from "@angular/core";
import { FileService, FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { forkJoin } from "rxjs";
import { DialogService } from "primeng/dynamicdialog";
import { FileManagerPermissionType } from '@eleon/file-manager-proxy';
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { RenameEntryComponent } from "../rename-entry/rename-entry.component";
import { MoveEntryComponent, MoveEntryData } from "../move-entry/move-entry.component";
import { CopyEntryComponent, CopyEntryData } from "../copy-entry/copy-entry.component";
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { FileManagerDetailsService } from "../../core/services/file-manager-details.service";
import { ArchiveManagerService } from "../../core/services/archive-manager.service";
import { FileManagerViewSettingsService } from "../../core/services/file-manager-view-settings.service";
import { FileManagerPermissionsService } from '../../core/services/file-manager-permisisions.service';
import { FileManagerTab } from '../../core/file-manager-tab.enum';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';
import { Folder } from '../../core/folder';

@Component({
  standalone: false,
  selector: "app-file-manager-explorer-toolbar",
  templateUrl: "./file-manager-explorer-toolbar.component.html",
  styleUrls: ["./file-manager-explorer-toolbar.component.scss"],
})

export class FileManagerExplorerToolbarComponent {
  currentPermissions = computed(() => this.fileManagerPermissionsService.currentPermissions());

  get isModifyAllowed() {
    return (
      this.fileManagerViewSettingsService.readonlyCurrentTab() === FileManagerTab.FileExplorer &&
      !!this.currentPermissions()?.includes(FileManagerPermissionType.Modify)
    )
  }

  get isRestoreAllowed() {
    return this.fileManagerViewSettingsService.readonlyCurrentTab() === FileManagerTab.Trash;
  }

  folders = computed(() => this.fileManagerDetailsService.currentFolderContentFolders());
  files = computed(() => this.fileManagerDetailsService.currentFolderContentFiles());

  selectedArchive = this.archiveManager.readonlySelectedArchive;
  selectedFolder = this.fileManagerDetailsService.readonlyCurrentFolderDetails;
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;
  isMobileDevice = false;

  constructor(
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
    private fileManagerPermissionsService: FileManagerPermissionsService,
    private fileManagerDetailsService: FileManagerDetailsService,
    private archiveManager: ArchiveManagerService,
    private fileManagerSelectedContentService: FileManagerSelectedContentService,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
    private dialogService: DialogService,
    private localizationService: ILocalizationService,
    private fileHelperService: FileHelperService,
    private confirmationService: LocalizedConfirmationService
  ) {
    this.isMobileDevice = window.innerWidth <= 576;
  }


  downloadAll() {
    this.fileManagerViewSettingsService.loadingDownloading = true;

    const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
    const documentIds = selectedEntries.filter(isFile).map(entry => entry.id ?? '').filter(id => id);
    const folderIds = selectedEntries.filter(isFolder).map(entry => entry.id ?? '').filter(id => id);
    
    this.fileService
      .downloadAllByDownloadAllDto({
        fileIds: documentIds,
        folders: folderIds,
        parentId: this.selectedFolder()?.id,
        archiveId: this.selectedArchive()?.id,
        fileManagerType: this.fileManagerType(),
      })
      .subscribe((result) => {
        this.fileHelperService.saveBase64File(
          result as any,
          this.selectedFolder()?.name + ".zip"
        );
      },
      () => {},
      () => {
        this.fileManagerViewSettingsService.loadingDownloading = false;
      }
    );
  }

  deleteAll() {
    this.confirmationService.confirm("FileManager::DeleteConfirmation", () => {
      this.fileManagerViewSettingsService.loadingDownloading = true;
      const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
      const deleteEntries = selectedEntries.map((entry) => {
        if (!entry.id) {
          return null;
        }
        return this.fileService.deleteEntryByIdAndArchiveIdAndType(
          entry.id,
          this.selectedArchive()?.id,
          this.fileManagerType()
        );
      }).filter(op => op !== null);
      
      forkJoin(deleteEntries).subscribe(
        (results) => {
          this.fileManagerSelectedContentService.resetSelectedItems();
          this.fileManagerViewSettingsService.reloadCurrentFolder();
          this.messageService.success("FileManager::SuccesfulyDeleted"); //Selected files or folders deleted.
        },
        () => {
        },
        () => {
          this.fileManagerViewSettingsService.loadingDownloading = false;
        }
      );
    });
  }
  
  restoreAll() {
    this.fileManagerViewSettingsService.loadingDownloading = true;
    const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
    const restoreEntries = selectedEntries.map((entry) => {
      if (!entry.id) {
        return null;
      }
      return this.fileService.restoreEntryByIdAndArchiveIdAndType(
        entry.id,
        this.selectedArchive()?.id,
        this.fileManagerType()
      );
    }).filter(op => op !== null);
    
    forkJoin(restoreEntries).subscribe(
      (results) => {
        this.fileManagerSelectedContentService.resetSelectedItems();
        this.fileManagerViewSettingsService.reloadCurrentFolder();
        this.messageService.success("FileManager::SuccesfulyRestored");
      },
      () => {},
      () => {
        this.fileManagerViewSettingsService.loadingDownloading = false;
      }
    );
  }

  onMoved() {
    const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
    if (selectedEntries.length === 0) {
      return;
    }

    const rootFolder = this.selectedArchive()?.rootFolderId;
    if (!rootFolder) {
      return;
    }

    // Get root folder entry for the dialog
    this.fileService.getEntryByIdByIdAndArchiveIdAndType(rootFolder, this.selectedArchive()?.id, this.fileManagerType())
      .subscribe((rootEntry: FileSystemEntryDto) => {
        if (!rootEntry || !isFolder(rootEntry)) {
          return;
        }

        const moveData: MoveEntryData = {
          root: rootEntry as unknown as Folder, // Convert to Folder type for compatibility
          sourceId: selectedEntries[0]?.id ?? '',
          sourceName: selectedEntries[0]?.name ?? '',
          sourceParentId: this.selectedFolder()?.id,
          archiveId: this.selectedArchive()?.id ?? '',
          fileManagerType: this.fileManagerType(),
          entries: selectedEntries.length > 1 ? selectedEntries : undefined,
          entry: selectedEntries.length === 1 ? selectedEntries[0] : undefined,
        };

        const dialogRef = this.dialogService.open(MoveEntryComponent, {
          width: '600px',
          header: this.localizationService.instant('FileManager::Move'),
          data: moveData,
        });

        dialogRef.onClose.subscribe((result: { flag?: boolean }) => {
          if (result?.flag) {
            this.messageService.success("FileManager::FileMoved:Success");
            this.fileManagerSelectedContentService.resetSelectedItems();
            this.fileManagerViewSettingsService.reloadCurrentFolder();
          }
        });
      });
  }

  onCopy() {
    const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
    if (selectedEntries.length === 0) {
      return;
    }

    const rootFolder = this.selectedArchive()?.rootFolderId;
    if (!rootFolder) {
      return;
    }

    // Get root folder entry for the dialog
    this.fileService.getEntryByIdByIdAndArchiveIdAndType(rootFolder, this.selectedArchive()?.id, this.fileManagerType())
      .subscribe((rootEntry: FileSystemEntryDto) => {
        if (!rootEntry || !isFolder(rootEntry)) {
          return;
        }

        const copyData: CopyEntryData = {
          root: rootEntry as unknown as Folder, // Convert to Folder type for compatibility
          sourceId: selectedEntries[0]?.id ?? '',
          sourceName: selectedEntries[0]?.name ?? '',
          sourceParentId: this.selectedFolder()?.id,
          archiveId: this.selectedArchive()?.id ?? '',
          fileManagerType: this.fileManagerType(),
          entries: selectedEntries.length > 1 ? selectedEntries : undefined,
          entry: selectedEntries.length === 1 ? selectedEntries[0] : undefined,
        };

        const dialogRef = this.dialogService.open(CopyEntryComponent, {
          width: '600px',
          header: this.localizationService.instant('FileManager::Copy'),
          data: copyData,
        });

        dialogRef.onClose.subscribe((result: { flag?: boolean }) => {
          if (result?.flag) {
            this.messageService.success("FileManager::FileCopied:Success");
            this.fileManagerSelectedContentService.resetSelectedItems();
            this.fileManagerViewSettingsService.reloadCurrentFolder();
          }
        });
      });
  }

  onRename() {
    const selectedEntries = this.fileManagerSelectedContentService.getSelectedEntries();
    if (selectedEntries.length > 1) {
      this.messageService.warn('FileManager::CantRenameMultipleItemsAtOnce');
      return;
    }

    const entry = selectedEntries[0];
    if (!entry) {
      return;
    }

    const isFileEntry = isFile(entry);
    const headerKey = isFileEntry 
      ? "FileManager::RenameFile" 
      : "FileManager::RenameFolder";
    const successKey = isFileEntry 
      ? "FileManager::FileRenamed:Success" 
      : "FileManager::FolderRenamed:Success";

    const dialogRef = this.dialogService.open(RenameEntryComponent, {
      width: "400px",
      header: this.localizationService.instant(headerKey),
      data: {
        archiveId: this.selectedArchive()?.id,
        entry: entry,
        fileManagerType: this.fileManagerType(),
        parentFolder: this.fileManagerDetailsService.readonlyCurrentFolderDetails(),
      },
    });
    dialogRef.onClose.subscribe((result) => {
      if (result && entry.id) {
        this.messageService.success(successKey);
        this.fileManagerSelectedContentService.resetSelectedItems();
        if (isFileEntry) {
          this.fileManagerDetailsService.renameFile(entry.id, result);
        } else {
          this.fileManagerDetailsService.renameFolder(entry.id, result);
        }
      }
    });
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
}
