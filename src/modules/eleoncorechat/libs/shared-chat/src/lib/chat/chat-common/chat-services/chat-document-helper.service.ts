import { Injectable } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatInteractionService } from '@eleon/collaboration-proxy';
import { DocumentViewerService } from "@eleon/primeng-ui.lib";
import { FileHelperService } from '@eleon/primeng-ui.lib';

@Injectable({
  providedIn: "root",
})
export class ChatDocumentHelperService {
  constructor(
    private fileService: FileHelperService,
    private chatService: ChatInteractionService,
    private documentViewer: DocumentViewerService
  ) {}

  public downloadDocument(msg: ChatMessageDto): void {
    this.chatService
      .retreiveDocumentMessageContentByMessageId(msg.id)
      .subscribe((response) => {
        if (response) {
          this.fileService.saveBase64File(response, this.getDocumentName(msg));
        }
      });
  }

  public openDocument(msg: ChatMessageDto): void {
    this.chatService
      .retreiveDocumentMessageContentByMessageId(msg.id)
      .subscribe((response) => {
        if (response) {
          this.documentViewer.openDocumentViewer(
            response,
            this.getDocumentName(msg)
          );
        }
      });
  }

  public getDocumentName(message: ChatMessageDto): string {
    const msg = JSON.parse(message.content);
    return msg.Filename;
  }

  public createDocumentContent(
    filename: string,
    blobRef: string = null
  ): string {
    return JSON.stringify({ Filename: filename, BlobRefId: blobRef });
  }

  public documentPreviewSupported(message: ChatMessageDto): boolean {
    return this.documentViewer.supports(this.getDocumentName(message));
  }
}
