import { Component, Input } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import {
  ChatMessageSenderType,
  ChatMessageType,
} from '@eleon/collaboration-proxy';
import { VportalMessage } from "../chat-types";
import { ChatMemberInfo } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls: ["./chat-message.component.scss"],
})
export class ChatMessageComponent {
  @Input()
  message: VportalMessage;

  direction: string;

  constructor() {
      this.direction = document.body.dir
    }


  public get margin(): string {
    return "mb-2";
  }

  public get messageData(): ChatMessageDto {
    return this.message.msg;
  }

  public get sender(): ChatMemberInfo {
    return this.message.msg.senderInfo;
  }

  public get isIncoming(): boolean {
    return !this.message.msg.outcoming;
  }

  public get isOutcoming(): boolean {
    return this.message.msg.outcoming;
  }

  public get isSystem(): boolean {
    return this.message.msg.senderType === ChatMessageSenderType.System;
  }

  public get sending(): boolean {
    return this.message.sending;
  }

  public get creationTimeDisplayAbsolute(): boolean {
    return this.isSystem;
  }

  public get wrapperClass(): string {
    return this.getClass(this.margin, "align-items-" + this.horizontalAlign);
  }

  public get messageStyle(): any {
    const textColor = this.getByType(
      "white",
      "var(--gray-900)",
      "var(--gray-800)"
    );
    const backgroundColor = this.getByType(
      "var(--blue-500)",
      "var(--surface-ground)",
      "var(--yellow-200)"
    );

    return {
      color: textColor,
      "background-color": backgroundColor,
      "word-break": "break-all",
      ...this.messageBorder,
    };
  }

  public get messageFlexDirection(): string {
    return this.getClass(
      this.getByType(
        "justify-content-start",
        "justify-content-start",
        "justify-content-center"
      ),
      this.getByType("flex-row", "flex-row-reverse", "flex-row")
    );
  }

  public get messageCssClass(): string {
    const padding = this.getByType("p-3", "p-custom", "p-2");
    const textAlign = `text-${this.horizontalAlign}`;
    return this.getClass(padding, textAlign, "relative");
  }

  public get showAvatar(): boolean {
    return (
      this.message.msg.senderType === ChatMessageSenderType.User &&
      this.message.groupStart
    );
  }

  public get showName(): boolean {
    return (
      this.message.msg.senderType === ChatMessageSenderType.User &&
      this.message.groupStart
    );
  }

  public get showTime(): boolean {
    return (
      this.message.msg.senderType === ChatMessageSenderType.User &&
      this.message.groupStart
    );
  }

  public get horizontalAlign(): string {
    return this.getByType("start", "end", "center");
  }

  private get messageBorder(): any {
    if (this.isSystem) {
      return { "border-radius": this.softRound };
    }

    let topLeftRadius = "";
    let topRightRadius = "";
    let botLeftRadius = "";
    let botRightRadius = "";

    if(this.direction === 'ltr'){
      topLeftRadius = this.message.groupStart || this.isOutcoming
        ? this.strongRound
        : this.softRound;

        topRightRadius = this.message.groupStart || this.isIncoming
        ? this.strongRound
        : this.softRound ;

        botLeftRadius = 
        this.message.groupEnd
          ? this.isIncoming
            ? this.pipRound
            : this.strongRound
          : this.isIncoming
          ? this.softRound
          : this.strongRound;

        botRightRadius =
          this.message.groupEnd
          ? this.isOutcoming
            ? this.pipRound
            : this.strongRound
          : this.isOutcoming
          ? this.softRound
          : this.strongRound

    } else{
      topRightRadius = this.message.groupStart || this.isOutcoming
        ? this.strongRound
        : this.softRound;

        topLeftRadius = this.message.groupStart || this.isIncoming
        ? this.strongRound
        : this.softRound ;

        botRightRadius = 
        this.message.groupEnd
          ? this.isIncoming
            ? this.pipRound
            : this.strongRound
          : this.isIncoming
          ? this.softRound
          : this.strongRound;

          botLeftRadius =
          this.message.groupEnd
          ? this.isOutcoming
            ? this.pipRound
            : this.strongRound
          : this.isOutcoming
          ? this.softRound
          : this.strongRound
    };
      
    return {
      "border-top-left-radius": topLeftRadius,
      "border-top-right-radius": topRightRadius,
      "border-bottom-left-radius": botLeftRadius,
      "border-bottom-right-radius": botRightRadius,
    };
  }

  private get strongRound(): string {
    return "10px";
  }

  private get softRound(): string {
    return "5px";
  }

  private get pipRound(): string {
    return "0px";
  }

  private getByType(incoming: any, outcoming: any, system: any) {
    if (this.isSystem) {
      return system;
    }

    return this.isIncoming ? incoming : outcoming;
  }

  private getClass(...classes: any) {
    return classes.join(" ");
  }
}
