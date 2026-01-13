import { FileManagerDetailsService } from '../../core/services/file-manager-details.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FileManagerType, FileService, RenameEntryDto } from '@eleon/file-manager-proxy';
import { FileSystemEntryDto, HierarchyFolderDto } from '@eleon/file-manager-proxy';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { isFile, isFolder } from '../../shared/utils/entry-helpers';

@Component({
  standalone: false,
  selector: 'app-rename-entry',
  templateUrl: './rename-entry.component.html',
  styleUrl: './rename-entry.component.scss'
})
export class RenameEntryComponent implements OnInit {

  isLoading = false;
  entryName: string;
  entryNameEmpty: boolean = false;
  fileExtension: string = '';
  isFileEntry: boolean = false;

  get data() {
    return this.config.data;
  }

  get entry(): FileSystemEntryDto {
    return this.data?.entry;
  }

  constructor(
    private fb: UntypedFormBuilder,
    public config: DynamicDialogConfig<{
      parentFolder: HierarchyFolderDto,
      archiveId: string,
      entry: FileSystemEntryDto,
      fileManagerType: FileManagerType
    }>,
    public dialogRef: DynamicDialogRef,
    private fileService: FileService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService
  ) {
  }

  ngOnInit(): void {
    if (!this.entry) {
      return;
    }

    this.isFileEntry = isFile(this.entry);
    this.entryName = this.entry.name ?? '';

    if (this.isFileEntry && this.entryName?.length > 0) {
      const lastDotIndex = this.entryName.lastIndexOf(".");
      if (lastDotIndex > 0) {
        this.fileExtension = this.entryName.substring(lastDotIndex);
        this.entryName = this.entryName.substring(0, lastDotIndex);
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  renameEntry() {
    if (!this.entryName.trim()) {
      this.entryNameEmpty = true;
      const errorKey = this.isFileEntry 
        ? "FileManager::FileNameEmpty" 
        : "FileManager::FolderNameEmpty";
      this.messageService.error(errorKey);
      return;
    } else {
      this.entryNameEmpty = false;
    }

    this.isLoading = true;
    const newName = this.isFileEntry 
      ? this.entryName + this.fileExtension
      : this.entryName;

    const renameDto: RenameEntryDto = {
      id: this.entry.id,
      name: newName
    };

    this.fileService.renameEntryByDtoAndArchiveIdAndType(renameDto, this.data.archiveId, this.data.fileManagerType)
      .subscribe((result: FileSystemEntryDto) => {
        this.isLoading = false;
        this.dialogRef.close(newName);
      }, () => this.isLoading = false);
  }
}

