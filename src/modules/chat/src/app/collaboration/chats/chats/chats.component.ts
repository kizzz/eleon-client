import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router'
import { UserChatInfoDto } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-chats",
  templateUrl: "./chats.component.html",
  styleUrls: ["./chats.component.scss"],
})
export class ChatsComponent {
  public selectedChat: UserChatInfoDto;
  public noChats: boolean;

  public title = 'Collaboration::ChatList:Title';

  constructor(route: ActivatedRoute) {
    this.title = route.snapshot.data['title'];
  }


  public onSidebarVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.selectedChat = null;
    }
  }
}
