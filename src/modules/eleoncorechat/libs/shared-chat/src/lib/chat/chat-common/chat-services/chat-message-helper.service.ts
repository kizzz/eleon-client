import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Injectable } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatRoomDto } from '@eleon/collaboration-proxy';
import { ChatInteractionService } from '@eleon/collaboration-proxy';
import {
  ChatMemberRole,
  ChatMessageSenderType,
  ChatMessageSeverity,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { Observable } from "rxjs";
import { ChatDocumentHelperService } from "./chat-document-helper.service";
import { FileHelperService } from '@eleon/primeng-ui.lib';
import { generateGuid } from "@eleon/angular-sdk.lib";

interface SendMessageRequest {
  msg: ChatMessageDto;
  request: Observable<ChatMessageDto>;
}

@Injectable({
  providedIn: "root",
})
export class ChatMessageHelperService {
  constructor(
    private config: IApplicationConfigurationManager,
    private chatService: ChatInteractionService,
    private fileService: FileHelperService,
    private documentHelper: ChatDocumentHelperService
  ) {}

  public isOutcoming(message: ChatMessageDto): boolean {
    return (
      message.senderType === ChatMessageSenderType.User &&
      message.sender == this.config.getAppConfig().currentUser?.id
    );
  }

  public async createTempVportalMessagesFromNebular(
    message: any,
    chatRoom: ChatRoomDto,
    role: ChatMemberRole
  ): Promise<SendMessageRequest[]> {
    let msgs: SendMessageRequest[] = [];
    const msgText = message.message?.trim();
    if (msgText?.length) {
      msgs.push({
        msg: this.createTextMessage(generateGuid(), msgText, chatRoom, role),
        request: this.chatService.sendTextMessageByRequest({
          chatId: chatRoom.id,
          message: msgText,
          severity: ChatMessageSeverity.None,
        }),
      });
    }

    const msgFiles = message.files;
    if (msgFiles?.length) {
      for (const file of msgFiles) {
        msgs.push({
          msg: this.createDocumentMessage(
            generateGuid(),
            file.name,
            chatRoom,
            role
          ),
          request: this.chatService.sendDocumentMessageByRequest({
            chatId: chatRoom.id,
            filename: file.name,
            documentBase64: await this.fileService.fileToBase64(file),
          }),
        });
      }
    }

    return msgs;
  }

  public createTextMessage(
    id: string,
    text: string,
    chatRoom: ChatRoomDto,
    role: ChatMemberRole
  ): ChatMessageDto {
    return {
      ...this.createMessage(id, chatRoom, role, ChatMessageType.PlainText),
      content: text,
    };
  }

  public createDocumentMessage(
    id: string,
    filename: string,
    chatRoom: ChatRoomDto,
    role: ChatMemberRole
  ): ChatMessageDto {
    return {
      ...this.createMessage(id, chatRoom, role, ChatMessageType.Document),
      content: this.documentHelper.createDocumentContent(filename),
    };
  }

  private createMessage(
    id: string,
    chatRoom: ChatRoomDto,
    role: ChatMemberRole,
    type: ChatMessageType
  ): ChatMessageDto {
    return {
      id,
      creationTime: new Date().toISOString(),
      content: null,
      sender: this.config.getAppConfig().currentUser?.id,
      type,
      chatRoomId: chatRoom.id,
      severity: ChatMessageSeverity.None,
      unread: false,
      outcoming: true,
      senderInfo: {
        id: this.config.getAppConfig().currentUser?.id,
        name: this.config.getAppConfig().currentUser?.name,
        role,
      },
      senderType: ChatMessageSenderType.User,
    };
  }
}
