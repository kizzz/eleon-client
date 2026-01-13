import { computed, effect, EventEmitter, Injectable, signal } from '@angular/core';
import { FileArchivePermissionService, FileManagerType, PermissionActorType } from '@eleon/file-manager-proxy';
import { FileArchiveDto } from '@eleon/file-manager-proxy';
import { FileManagerPermissionType } from '@eleon/file-manager-proxy';
import { FileManagerDetailsService } from './file-manager-details.service';
import { ArchiveManagerService } from './archive-manager.service';
import { first } from 'rxjs';
import { FileManagerViewSettingsService } from './file-manager-view-settings.service';

@Injectable()
export class FileManagerPermissionsService {
  
  public readonly currentPermissions = signal<FileManagerPermissionType[]>(null);
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    private archiveManagerService : ArchiveManagerService,
    private filePermissionService: FileArchivePermissionService,
    private fileManagerDetailsService: FileManagerDetailsService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
  ) {
    effect(() => {
    const folderId = this.fileManagerViewSettingsService.readonlyCurrentFolderId();

    if (!folderId) {
      return;
    }

    if (this.fileManagerType() === FileManagerType.Provider) {
      this.currentPermissions.set([]);
      return;
    }
    this.fileManagerViewSettingsService.loadingPermissions = true;
    this.filePermissionService.getPermissionOrDefaultByKey({
      archiveId: this.archiveManagerService.readonlySelectedArchiveId(),
      folderId: folderId,
      actorType: PermissionActorType.User,
    })
      .pipe(first())
      .subscribe(result => { 
        this.currentPermissions.set(result);
      }, err => {
        this.currentPermissions.set([]);
      }, () => {
        this.fileManagerViewSettingsService.loadingPermissions = false;
      })
    }, {allowSignalWrites: true});
  }
}
