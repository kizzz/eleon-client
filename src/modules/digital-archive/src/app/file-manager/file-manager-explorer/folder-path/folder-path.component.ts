import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { Component, effect } from '@angular/core';
import { FolderPath } from '../../core/folder-path';
import { HierarchyFolderDto, FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { first } from 'rxjs';
import { FileService } from '@eleon/file-manager-proxy';
import { MenuItem } from 'primeng/api';
import { ArchiveManagerService } from '../../core/services/archive-manager.service';
import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { FileManagerViewSettingsService } from '../../core/services/file-manager-view-settings.service';
import { isFolder } from '../../shared/utils/entry-helpers';

@Component({
  standalone: false,
  selector: 'app-folder-path',
  templateUrl: './folder-path.component.html',
  styleUrls: ['./folder-path.component.scss'],
})
export class FolderPathComponent {
  folderPaths: FolderPath[] = [];

  fileNameMaxLength = 10;
  breadcrumbs: MenuItem[] = [];
  home: MenuItem | undefined;
  selectedArchiveId = this.archiveManager.readonlySelectedArchiveId;
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    private fileService: FileService,
    private fileManagerDetailsService: FileManagerDetailsService,
    public fileManagerViewSettingsService: FileManagerViewSettingsService,
    private messageService: LocalizedMessageService,
    private archiveManager: ArchiveManagerService
  ) {
    effect(() => {
      const id = this.fileManagerViewSettingsService.readonlyCurrentFolderId();
      if (id && this.selectedArchiveId()) {
        this.getPath(id);
      } else {
        this.folderPaths = [];
      }
    });
  }

  getPath(id) {
    this.fileService
      .getEntryParentsByIdByIdAndArchiveIdAndType(id, this.selectedArchiveId(), this.fileManagerType())
      .pipe(first())
      .subscribe((paths: HierarchyFolderDto[]) => {
        if (paths?.length > 0) {
          paths[0].name = '';
          this.folderPaths = paths as any;

          this.home = {
            icon: 'pi pi-home',
            command: () => {
              this.fileManagerViewSettingsService.setCurrentFolderId(
                this.archiveManager.selectedArchive().rootFolderId
              );
            },
            tooltip: 'Home',
          };
          this.breadcrumbs = this.firstAndLastElementsWithEllipsis(
            this.folderPaths.slice(1).map((f) => {
              return {
                label:
                  f.name.length > this.fileNameMaxLength
                    ? f.name.slice(0, this.fileNameMaxLength) + '...'
                    : f.name,
              };
            })
          );
        } else {
          this.folderPaths = [];
        }
        if (!paths?.length) {
          return;
        }
      });
  }
  firstAndLastElementsWithEllipsis(arr: MenuItem[]) {
    // Check if the array is empty
    if (arr.length === 0) {
      return [];
    }
    // Check if the array has only one element
    if (arr.length === 1) {
      return [arr[0]];
    }
    // If the array has more than two elements, include "..." in the middle
    if (arr.length > 2) {
      return [
        arr[0],
        {
          label: '...',
          tooltip: arr
            .slice(1, arr.length - 1)
            .map((a) => a.label)
            .join('/'),
        },
        arr[arr.length - 1],
      ];
    }
    // If the array has exactly two elements (and they are different), return them
    return [arr[0], arr[arr.length - 1]];
  }

  onPathClick(folder: FileSystemEntryDto | HierarchyFolderDto) {
    const folderEntry = 'entryKind' in folder ? folder as FileSystemEntryDto : null;
    if (folderEntry && !isFolder(folderEntry)) {
      return; // Only folders can be navigated to
    }
    const folderId = folderEntry?.id ?? (folder as HierarchyFolderDto)?.id;
    if (folderId) {
      this.fileManagerViewSettingsService.setCurrentFolderId(folderId);
    }
  }

  up() {
    const currentFolder = this.fileManagerDetailsService.readonlyCurrentFolderDetails();
    if (currentFolder?.parentId) {
      this.fileManagerViewSettingsService.setCurrentFolderId(currentFolder.parentId);
    } else if (this.folderPaths.length > 1) {
      this.onPathClick(this.folderPaths[this.folderPaths.length - 2] as any);
    } else {
      this.messageService.success('FileManager::YouAreInTheTopFolder');
    }
  }
  refresh() {
    this.fileManagerViewSettingsService.reloadCurrentFolder();
  }
}
