import { FileManagerUploadService } from '../../core/services/file-manager-upload.service';
import { Component, computed, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Folder } from '../../core/folder';
import { FileUploadService } from '../../core/file-upload.service';
import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { ArchiveManagerService } from '../../core/services/archive-manager.service';

@Component({
  standalone: false,
  selector: 'app-upload-file-folder',
  templateUrl: './upload-file-folder.component.html',
  styleUrls: ['./upload-file-folder.component.scss']
})
export class UploadFileFolderComponent implements OnInit {
  archiveId = this.archiveManager.readonlySelectedArchiveId;

  constructor(
    private archiveManager: ArchiveManagerService,
    private fileManagerUploadService: FileManagerUploadService,
    private fileManagerDetailsService: FileManagerDetailsService,
    public fileUploadService: FileUploadService,
  ) {
  }

  ngOnInit(): void {
  }

  fileEvent($event) {
    this.fileUploadService.upload($event?.target?.files, this.fileManagerDetailsService.currentFolderDetails().id, this.archiveId());
  }

  folderEvent($event) {
    this.fileUploadService.upload($event?.target?.files, this.fileManagerDetailsService.currentFolderDetails().id, this.archiveId());
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
}
