import { Component, Input } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatMessageHelperService } from "../chat-services/chat-message-helper.service";
import {
  ChatMessageSenderType,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { ChatTextHelperService } from "../chat-services/chat-text-helper.service";
import { ChatDocumentHelperService } from "../chat-services/chat-document-helper.service";

@Component({
  standalone: false,
  selector: "app-chat-message-preview",
  templateUrl: "./chat-message-preview.component.html",
  styleUrls: ["./chat-message-preview.component.scss"],
})
export class ChatMessagePreviewComponent {
  @Input()
  message: ChatMessageDto;

  public get previewText(): string {
    let text: string = "";

    if (this.isTextMessage) {
      text = this.textHelper.getMessageText(this.message);
    } else if (this.isDocumentMessage) {
      text = this.documentHelper.getDocumentName(this.message);
    }

    return text;
  }

  public get icon(): string {
    if (this.isDocumentMessage) {
      return "fas fa-file-alt";
    }

    return null;
  }

  private get isTextMessage(): boolean {
    return (
      this.message.senderType === ChatMessageSenderType.System ||
      this.message.type === ChatMessageType.PlainText
    );
  }

  private get isDocumentMessage(): boolean {
    return this.message.type === ChatMessageType.Document;
  }

  constructor(
    private textHelper: ChatTextHelperService,
    private documentHelper: ChatDocumentHelperService
  ) {}
}
