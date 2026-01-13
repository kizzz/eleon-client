import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FileManagerType, FileService, EntryKind, CreateEntryDto } from '@eleon/file-manager-proxy';
import { HierarchyFolderDto, FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-add-folder',
  templateUrl: './add-folder.component.html',
  styleUrls: ['./add-folder.component.scss']
})
export class AddFolderComponent implements OnInit {
  isLoading = false;
  folderName: string;
  folderNameEmpty: boolean;

  get data() {
    return this.config.data;
  }
  constructor(
    public config: DynamicDialogConfig<{folder: HierarchyFolderDto, archiveId: string, fileManagerType: FileManagerType}>,
    public dialogRef: DynamicDialogRef,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
  ) {
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addFolder() {
    if (!this.folderName.trim()) {
      this.folderNameEmpty = true;
      this.messageService.error("FileManager::FolderNameEmpty");
      return;
    } else {
      this.folderNameEmpty = false;
    }
  
    this.isLoading = true;
    const createDto: CreateEntryDto = {
      kind: EntryKind.Folder,
      name: this.folderName.trim(),
      parentId: this.config.data.folder?.id,
      isShared: false
    };
    this.fileService.createEntryByDtoAndArchiveIdAndType(createDto, this.data.archiveId, this.data.fileManagerType)
      .subscribe((folder: FileSystemEntryDto) => {
        this.isLoading = false;
        this.dialogRef.close(folder);
      }, 
      () => this.isLoading = false);
  }
}
