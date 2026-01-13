import { Component, Input } from "@angular/core";
import { ChatMessageHelperService } from "../chat-services/chat-message-helper.service";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import {
  ChatMessageSenderType,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { ChatDocumentHelperService } from "../chat-services/chat-document-helper.service";
import { ChatTextHelperService } from "../chat-services/chat-text-helper.service";

@Component({
  standalone: false,
  selector: "app-chat-message-content",
  templateUrl: "./chat-message-content.component.html",
  styleUrls: ["./chat-message-content.component.scss"],
})
export class ChatMessageContentComponent {
  @Input()
  message: ChatMessageDto;

  @Input()
  sending: boolean;

  public get messageText(): string {
    if (this.isTextMessage) {
      return this.textHelper.getMessageText(this.message);
    } else if (this.isDocumentMessage) {
      return this.documentHelper.getDocumentName(this.message);
    }

    return null;
  }

  public get icon(): string {
    if (this.isDocumentMessage) {
      return "fas fa-file-alt";
    }

    return null;
  }

  public get showPreview(): boolean {
    return this.documentHelper.documentPreviewSupported(this.message);
  }

  public get isTextMessage(): boolean {
    return (
      this.message.senderType === ChatMessageSenderType.System ||
      this.message.type === ChatMessageType.PlainText
    );
  }

  public get isDocumentMessage(): boolean {
    return this.message.type === ChatMessageType.Document;
  }

  constructor(
    private documentHelper: ChatDocumentHelperService,
    private textHelper: ChatTextHelperService
  ) {}

  public download(): void {
    this.documentHelper.downloadDocument(this.message);
  }

  public open(): void {
    this.documentHelper.openDocument(this.message);
  }
}
