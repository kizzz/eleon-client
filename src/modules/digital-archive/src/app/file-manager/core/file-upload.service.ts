import { FileManagerDetailsService } from './services/file-manager-details.service';
import { Injectable, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadProcessComponent } from '../shared/file-upload-process/file-upload-process.component';
import { FileService } from '@eleon/file-manager-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { ConfirmationService } from 'primeng/api';
import { FileManagerViewSettingsService } from './services/file-manager-view-settings.service';
import { FileManagerUploadService } from './services/file-manager-upload.service';
import { concatMap, finalize, from, Observable } from 'rxjs';

@Injectable()
export class FileUploadService {
  fileManagerType = this.fileManagerViewSettingsService.fileManagerType;

  constructor(
    public fileManagerUploadService: FileManagerUploadService,
    public fileManagerDetailsService: FileManagerDetailsService,
    public fileManagerViewSettingsService: FileManagerViewSettingsService,
    public overlay: DialogService,
    public fileService: FileService,
    public messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    public confirmationService: ConfirmationService
  ) {}

  getDuplicatedFiles(files: File[]): File[] {
    let existingFiles: File[] = [];
    const existingFileNames =
      this.fileManagerDetailsService.readonlyCurrentFolderFilenames();
    if (!existingFileNames) {
      return [];
    }

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      if (existingFileNames.includes(file.name)) {
        existingFiles.push(file);
      }
    }
    return existingFiles;
  }

  upload(files: File[], destinationFolderId: string, archiveId: string) {
    if (files.length === 0) {
      return;
    }

    const duplicatedFiles = this.getDuplicatedFiles(files);

    if (duplicatedFiles.length > 0) {
      this.confirmationService.confirm({
        header: this.localizationService.instant('Infrastructure::Warning'),
        message: this.localizationService.instant(
          'FileManager::OverrideExistingFiles',
          duplicatedFiles.join(',')
        ),
        accept: () => {
          this.uploadFiles(files, destinationFolderId, archiveId);
        },
        acceptLabel: this.localizationService.instant('Infrastructure::Yes'),
        rejectLabel: this.localizationService.instant('Infrastructure::No'),
        acceptButtonStyleClass:
          'p-button-sm p-button-raised p-button-text p-button-info',
        rejectButtonStyleClass:
          'p-button-sm p-button-raised p-button-text p-button-danger',
      });
    } else {
      this.uploadFiles(files, destinationFolderId, archiveId);
    }
  }

  private uploadFiles(
    files: File[],
    destinationFolderId: string,
    archiveId: string
  ) {
    if (this.fileManagerUploadService.progressBarOverlay) {
      this.fileManagerUploadService.resetDocumentUploadProcess();
      this.fileManagerUploadService.progressBarOverlay.close();
    }

    this.fileManagerUploadService.progressBarOverlay = this.overlay.open(
        FileUploadProcessComponent,
        {
          header:
            files?.length > 1
              ? this.localizationService.instant('FileManager::UploadingFiles')
              : this.localizationService.instant('FileManager::UploadingFile'),
          width: '600px',
        }
      );

    from(files)
      .pipe(
        concatMap((file) => {
          this.fileManagerUploadService.initializeDocumentUploadProcess(
            file.name
          );
          return new Observable<void>((observer) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.fileService
                .uploadFilesByFileUploadDto({
                  files: [
                    {
                      source: (reader.result as string).split(',')[1],
                      name: file.name,
                      type: file.type,
                      relativePath: file.webkitRelativePath,
                    },
                  ],
                  folderId: destinationFolderId,
                  archiveId,
                  fileManagerType: this.fileManagerType()
                })
                .subscribe({
                  next: (_) => {},
                  error: (err) => {
                    try {
                      const message = JSON.parse(err?.message)?.error?.message;
                      this.fileManagerUploadService.updateDocumentUploadProgress(
                        file.name,
                        100,
                        true,
                        message
                      );
                    } catch {
                      this.fileManagerUploadService.updateDocumentUploadProgress(
                        file.name,
                        100,
                        true,
                        this.localizationService.instant('FileManager::NoErrorMessage')
                      );
                    } finally {
                      observer.complete();
                    }
                  },
                  complete: () => {
                    this.fileManagerUploadService.updateDocumentUploadProgress(
                      file.name,
                      100
                    );
                    observer.complete();
                  },
                });
            };
            reader.readAsDataURL(file);
          });
        }),
        finalize(() => this.fileManagerViewSettingsService.reloadCurrentFolder())
      )
      .subscribe();
  }
}
