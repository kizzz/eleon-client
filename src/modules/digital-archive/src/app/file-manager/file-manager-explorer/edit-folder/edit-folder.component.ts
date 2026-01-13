import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileArchiveService } from '@eleon/file-manager-proxy';
import { FileArchiveDto } from '@eleon/file-manager-proxy';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrl: './edit-folder.component.scss'
})
export class EditFolderComponent {
  loading: boolean = false;
  isDeleteArchive: boolean = false;
  nameEmpty: boolean = false;

  @Input()
  display: boolean;

  @Input()
  selectedArchive: FileArchiveDto; 

  @Output()
  saveEvent = new EventEmitter<FileArchiveDto>();

  @Output()
  deleteEvent = new EventEmitter<void>();

  @Output()
  closeEvent = new EventEmitter<void>();

  constructor(
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private fileArchiveService: FileArchiveService,
    private pageStateService: PageStateService
  ) {

  }

  save(){
    if(this.isDeleteArchive){
      this.removeFileArchive();
    }
    else{
      this.updateArchiveName();
    }
  }

  removeFileArchive(): void {
    this.confirmationService.confirm('FileManager::Archives:RemoveConfirm', () => {
      this.loading = true;
      this.fileArchiveService.deleteFileArchiveById(this.selectedArchive.id).subscribe(success => {
        this.loading = false;
        if (success) {
          this.pageStateService.setNotDirty();
          this.messageService.success('FileManager::Archives:RemoveSuccess');
          this.deleteEvent.emit();
          this.close();
        } else {
          this.messageService.error('Delivery::Archives:RemoveFail');
        }
      });
    });
  }

  updateArchiveName() {
    if(!this.selectedArchive.name?.length){
      this.messageService.error('FileManager::ArchiveNameEmpty');
      this.nameEmpty = true;
      return;
    }

    this.loading = true;
    this.fileArchiveService.updateFileArchiveByFileArchive(this.selectedArchive).subscribe(result => {
      this.loading = false;
      if (result) {
        this.pageStateService.setNotDirty();
        this.messageService.success('FileManager::UpdateArchive:Success');
        this.saveEvent.emit(result);
        this.close();
      } else {
        this.messageService.error('FileManager::Fail');
      }
    });
  }

  resetNameValidator(){
    this.nameEmpty = false;
  }

  closeDialog(){
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm('Infrastructure::ConfirmLeavingDirty',
      ()=>{
        this.close();

      });
    } else {
      this.close();
    }
  }

  close(){
    this.pageStateService.setNotDirty();
    this.selectedArchive = {} as FileArchiveDto;
    this.loading = false;
    this.nameEmpty = false;
    this.isDeleteArchive = false;
    this.display = false;
    this.closeEvent.emit();
  }
}
