import { computed, EventEmitter, Injectable, signal } from '@angular/core';
import { FileArchiveService, FileManagerType } from '@eleon/file-manager-proxy';
import { FileArchiveDto } from '@eleon/file-manager-proxy';
import { FileManagerViewSettingsService } from './file-manager-view-settings.service';

@Injectable()
export class ArchiveManagerService {
  public readonly selectedArchive = signal<FileArchiveDto>(null);
  public readonly readonlySelectedArchive = computed<FileArchiveDto>(() =>
    this.selectedArchive()
  );
  public readonly readonlySelectedArchiveId = computed<string>(
    () => this.selectedArchive().id
  );
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    private fileArchiveService: FileArchiveService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService
  ) {}

  public setSelectedArchive(archiveId: string) {
    if (!archiveId) {
      this.selectedArchive.set(null);
      return;
    }
    if (this.fileManagerType() === FileManagerType.FileArchive) {
      this.fileManagerViewSettingsService.loadingArchive = true;
      this.fileArchiveService.getFileArchiveByIdById(archiveId).subscribe(
        (res: FileArchiveDto) => {
          this.selectedArchive.set(res);
        },
        (err) => {
          this.selectedArchive.set(null);
        },
        () => {
          this.fileManagerViewSettingsService.loadingArchive = false;
        }
      );
    }
    else if (this.fileManagerType() === FileManagerType.Provider) {
      this.selectedArchive.set({
        id: archiveId,
        name: '',
        rootFolderId: "/",
        storageProviderId: archiveId,
      } as FileArchiveDto);
    }
  }
}
