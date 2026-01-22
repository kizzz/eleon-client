import { ApplicationRef, Component, Input, NgZone } from "@angular/core";
import { NbChatFormComponent } from "@nebular/theme";
import { MessageService } from "primeng/api";
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-chat-document-uploader",
  templateUrl: "./chat-document-uploader.component.html",
  styleUrls: ["./chat-document-uploader.component.scss"],
})
export class ChatDocumentUploaderComponent {
  @Input()
  chatForm: NbChatFormComponent;

  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService
  ) {}

  handleFileInput(files: any): void {
    const MAX_SIZE_MB = 20 * 1024 * 1024;
    let size = 0;

    const fileList = files as FileList; 

    Array.from(fileList).forEach(file => {
      size += file?.size;
    });
    
    if (size > MAX_SIZE_MB) {
      this.messageService.add({severity: 'error', summary: this.localizationService.instant('Collaboration::MaxLengthUploadedFiles')})
      return;
    } else {
      for (const file of files) {
        const res = file;
        if (this.chatForm["imgDropTypes"].includes(file.type)) {
          const fr = new FileReader();
          fr.onload = (e) => {
            res.src = e.target.result;
            res.urlStyle = this.chatForm["domSanitizer"].bypassSecurityTrustStyle(
              `url(${res.src})`
            );
            this.chatForm["cd"].detectChanges();
          };
          fr.readAsDataURL(file);
        }
        this.chatForm.droppedFiles.push(res);
        this.chatForm["cd"].detectChanges();
      }
    }
    
  }
}
