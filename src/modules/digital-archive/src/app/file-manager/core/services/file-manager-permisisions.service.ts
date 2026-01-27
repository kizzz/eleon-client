import { computed, effect, EventEmitter, Injectable, signal } from '@angular/core';
import { FileArchivePermissionService, FileManagerType, PermissionActorType } from '@eleon/file-manager-proxy';
import { FileArchiveDto } from '@eleon/file-manager-proxy';
import { FileManagerPermissionType } from '@eleon/file-manager-proxy';
import { FileManagerDetailsService } from './file-manager-details.service';
import { ArchiveManagerService } from './archive-manager.service';
import { first } from 'rxjs';
import { FileManagerViewSettingsService } from './file-manager-view-settings.service';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Injectable()
export class FileManagerPermissionsService {
  
  public readonly currentPermissions = signal<FileManagerPermissionType[]>(null);
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    private archiveManagerService : ArchiveManagerService,
    private filePermissionService: FileArchivePermissionService,
    private fileManagerDetailsService: FileManagerDetailsService,
    private fileManagerViewSettingsService: FileManagerViewSettingsService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService
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
        this.currentPermissions.set([]);
      }, () => {
        this.fileManagerViewSettingsService.loadingPermissions = false;
      })
    }, {allowSignalWrites: true});
  }
}
