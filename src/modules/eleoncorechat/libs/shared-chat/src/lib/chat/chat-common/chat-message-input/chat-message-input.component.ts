import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatInteractionService } from '@eleon/collaboration-proxy';
import {
  ChatMessageSenderType,
  ChatMessageSeverity,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { generateGuid } from "@eleon/angular-sdk.lib";

interface SentMessage {
  msg: ChatMessageDto;
  tempId: string;
}

@Component({
  standalone: false,
  selector: "app-chat-message-input",
  templateUrl: "./chat-message-input.component.html",
  styleUrls: ["./chat-message-input.component.scss"],
})
export class ChatMessageInputComponent {
  messageText: string = "";

  @Input()
  chatId: string;

  @Output()
  sendingMessage = new EventEmitter<ChatMessageDto>();

  @Output()
  messageSent = new EventEmitter<SentMessage>();

  constructor(
    private chatService: ChatInteractionService,
    private config: IApplicationConfigurationManager
  ) {}

  submitMessage(): void {
    const tempId = generateGuid();
    this.sendingMessage.emit({
      id: tempId,
      content: this.messageText,
      chatRoomId: this.chatId,
      senderType: ChatMessageSenderType.User,
      sender: this.config.getAppConfig().currentUser?.id,
      creationTime: null,
      type: ChatMessageType.PlainText,
      unread: false,
      outcoming: true,
      senderInfo: null,
      severity: ChatMessageSeverity.None,
    });

    this.chatService
      .sendTextMessageByRequest({
        chatId: this.chatId,
        message: this.messageText,
        severity: ChatMessageSeverity.None,
      })
      .subscribe((message) => {
        this.messageSent.emit({ msg: message, tempId: tempId });
      });
  }
}
