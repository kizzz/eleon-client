import { ChatMessageHelperService } from "./chat-message-helper.service";
import { NebularMessage } from "../chat-types";
import { BehaviorSubject, Observable } from "rxjs";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import {
  ChatMemberRole,
  ChatMessageSenderType,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatRoomDto } from '@eleon/collaboration-proxy';
import { ChatTextHelperService } from "./chat-text-helper.service";
import { distinctBy, parseUtc } from "@eleon/angular-sdk.lib";

export class ChatCache {
  messagesSubj$ = new BehaviorSubject<NebularMessage[]>([]);
  tempMessages = new Map<string, ChatMessageDto>();

  public get messages(): NebularMessage[] {
    return this.messagesSubj$.value;
  }

  private set messages(value: NebularMessage[]) {
    this.messagesSubj$.next(value);
  }

  public get messagesCount(): number {
    return this.messagesSubj$.value.length;
  }

  public get messages$(): Observable<NebularMessage[]> {
    return this.messagesSubj$.asObservable();
  }

  constructor(
    private messageHelper: ChatMessageHelperService,
    private messageTextHelper: ChatTextHelperService
  ) {}

  public addTempOutcomingMessage(message: ChatMessageDto): void {
    const added = this.addOrUpdateMessage(message, true, true);
    this.tempMessages.set(message.id, added);
  }

  public addPermanentOutcomingMessage(
    message: ChatMessageDto,
    replaceId: string
  ): void {
    const tempMsg = this.tempMessages.get(replaceId);
    tempMsg.id = message.id;

    this.addOrUpdateMessage(message, true, false);
  }

  public pushMessage(message: ChatMessageDto): void {
    const isOutcoming = this.messageHelper.isOutcoming(message);
    if (!isOutcoming) {
      this.addOrUpdateMessage(message, isOutcoming, false);
    }
  }

  public addMessages(
    messages: ChatMessageDto[],
    sending: boolean = false
  ): void {
    const mapped = messages.map((item) => this.mapMessage(item, sending));

    const allMessages = [...mapped, ...this.messages].sort(
      (a, b) =>
        new Date(a.data.msg.creationTime).getTime() -
        new Date(b.data.msg.creationTime).getTime()
    );

    this.updateGroups(allMessages);

    this.messages = distinctBy(allMessages, (item) => item.data.msg.id);
  }

  private updateGroups(messages: NebularMessage[]): void {
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i].data;

      const msgTime = parseUtc(messages[i].data.msg.creationTime).getTime();

      const prevSender = messages[i - 1]?.data?.msg?.sender;
      const prevIs30minAgo =
        !!messages[i - 1] &&
        msgTime - parseUtc(messages[i - 1].data.msg.creationTime).getTime() >
          10 * 60 * 1000;

      const nextSender = messages[i + 1]?.data?.msg?.sender;
      const nextIsAfter30min =
        !!messages[i + 1] &&
        parseUtc(messages[i + 1].data.msg.creationTime).getTime() - msgTime >
          10 * 60 * 1000;

      msg.groupStart = msg.msg.sender != prevSender || prevIs30minAgo;
      msg.groupEnd = msg.msg.sender != nextSender || nextIsAfter30min;
    }
  }

  private addOrUpdateMessage(
    message: ChatMessageDto,
    outcoming: boolean,
    loading: boolean
  ): ChatMessageDto {
    const present = this.messages.find(
      (item) => item.data.msg.id === message.id
    );

    if (present) {
      present.data.msg = message;
      present.text = this.messageTextHelper.getMessageText(message);
      present.data.msg.outcoming = outcoming;
      present.data.sending = loading;
      this.messages = [...this.messages];
      return present.data.msg;
    } else {
      const newMsg = {
        ...message,
        outcoming,
      };
      this.addMessages([newMsg], loading);
      return newMsg;
    }
  }

  private mapMessage(
    msg: ChatMessageDto,
    sending: boolean = false
  ): NebularMessage {
    return {
      data: {
        msg,
        sending,
        groupStart: false,
        groupEnd: false,
      },
      text: this.messageTextHelper.getMessageText(msg),
      type: "custom", // msg.type === ChatMessageType.PlainText ? "text" : "system",
      sender: msg.sender,
    };
  }
}
