
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Injectable } from "@angular/core";
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatMessageType } from '@eleon/collaboration-proxy';

@Injectable({
  providedIn: "root",
})
export class ChatTextHelperService {
  constructor(private localizationService: ILocalizationService) {}

  public getMessageText(message: ChatMessageDto): string {
    try {
      switch (message.type) {
        case ChatMessageType.ChatCreated:
          return this.getChatCreatedMessageText(message.content);
        case ChatMessageType.MembersKicked:
          return this.getUsersKickedMessageText(message.content);
        case ChatMessageType.MembersAdded:
          return this.getUsersAddedMessageText(message.content);
        case ChatMessageType.UserLeft:
          return this.getUserLeftMessageText(message.content);
        case ChatMessageType.ChatClosed:
          return this.getChatClosedMessageText(message.content);
        case ChatMessageType.ChatRenamed:
          return this.getChatRenamedMessageText(message.content);
        case ChatMessageType.LocalizedText:
          return this.getLocalizedMessageText(message.content);
        case ChatMessageType.MemberJoined:
          return this.getJoinedMessageText(message.content);
        default:
          return message.content;
      }
    } catch {
      return "";
    }
  }

  private getChatCreatedMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      "Collaboration::ChatCreatedMessage",
      obj.CreatedByUser.Name
    );
  }

  private getUsersKickedMessageText(json: string): string {
    const obj = JSON.parse(json);
    if (obj.KickedUsers.length === 1) {
      return this.localizationService.instant(
        "Collaboration::UserKickedMessage",
        obj.KickedByUser.Name,
        obj.KickedUsers[0].Name
      );
    }

    return this.localizationService.instant(
      "Collaboration::UsersKickedMessage",
      obj.KickedByUser.Name,
      obj.KickedUsers[0].Name,
      (obj.KickedUsers.length - 1).toString()
    );
  }

  private getJoinedMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      "Collaboration::UserJoinedMessage",
      obj?.JoinedUser?.Name
    );
  }

  private getUsersAddedMessageText(json: string): string {
    const obj = JSON.parse(json);
    if (obj.AddedUsers.length === 1) {
      return this.localizationService.instant(
        "Collaboration::UserAddedMessage",
        obj.AddedByUser.Name,
        obj.AddedUsers[0].Name
      );
    }

    return this.localizationService.instant(
      "Collaboration::UsersAddedMessage",
      obj.AddedByUser.Name,
      obj.AddedUsers[0].Name,
      (obj.AddedUsers.length - 1).toString()
    );
  }

  private getUserLeftMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      "Collaboration::UserLeftMessage",
      obj.User.Name
    );
  }

  private getChatClosedMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      "Collaboration::ChatClosedMessage",
      obj.ClosedByUser.Name
    );
  }

  private getChatRenamedMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      "Collaboration::ChatRenamedMessage",
      obj.RenamedByUser.Name,
      obj.OldName,
      obj.NewName
    );
  }

  private getLocalizedMessageText(json: string): string {
    const obj = JSON.parse(json);
    return this.localizationService.instant(
      obj.LocalizationKey,
      ...obj.LocalizationParams
    );
  }
}
