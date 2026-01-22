import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Component, Input } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatRoomType } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-chat-icon",
  templateUrl: "./chat-icon.component.html",
  styleUrls: ["./chat-icon.component.scss"],
})
export class ChatIconComponent {
  @Input()
  chat: UserChatInfoDto;

  public currentUserId: string;

  constructor(private config: IApplicationConfigurationManager) {
    this.currentUserId = this.config.getAppConfig().currentUser?.id;
  }

  public get showIcon(): boolean {
    return !this.showAvatar;
  }

  public get showAvatar(): boolean {
    return (
      (this.chat.chat.type === ChatRoomType.Group ||
        this.chat.chat.type === ChatRoomType.Private) &&
      this.chat.chat.chatMembersPreview.length === 2 && !this.chat.chat.isPublic
    );
  }

  public get chatImages(): string[] {
    return this.chat.chat.chatMembersPreview.map((x) => x.id);
  }

  public get chatType(): string {
    switch (this.chat.chat.type) {
      case ChatRoomType.Group:
        return "group";
      case ChatRoomType.SupportTicket:
        return "ticket";
    }

    return "";
  }

  public get chatIcon(): string {
    if (this.chat.chat.tags.includes("support")) {
      return "fas fa-flag";
    }

    if (this.chat.chat.isPublic){
      return "fas fa-users";
    }

    if (this.chat.chat.type == ChatRoomType.Group){
      return "fas fa-comment-dots";
    }

    return "";
  }
}
