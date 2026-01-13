import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-chat-list-box",
  templateUrl: "./chat-list-box.component.html",
  styleUrls: ["./chat-list-box.component.scss"],
})
export class ChatListBoxComponent {
  @Input()
  chats: UserChatInfoDto[];

  @Input()
  public menuView: boolean = false;

  @Input()
  public loading: boolean = false;

  @Input()
  sideBarView = false;

  @Input()
  public selectedChat: UserChatInfoDto;

  @Input()
  searchQuery: string = "";
  
  @Output()
  public selectedChatChange = new EventEmitter<UserChatInfoDto>();

  public currentUserId: string;

  constructor(private config: IApplicationConfigurationManager) {
    this.currentUserId = this.config.getAppConfig().currentUser?.id;
  }

  public onSelectionChange(selected: UserChatInfoDto): void {
    if (!this.menuView) {
      this.selectedChat = selected;
    }

    this.selectedChatChange.emit(selected);
  }

  public getChatImages(chat: UserChatInfoDto) {
    if (chat.chat.chatMembersPreview.length > 3){
      return chat.chat.chatMembersPreview.slice(0, 3).map((x) => x.id);
    }
    return chat.chat.chatMembersPreview.map((x) => x.id); 
  }
}
