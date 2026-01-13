import { Component } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-support-tickets",
  templateUrl: "./support-tickets.component.html",
  styleUrls: ["./support-tickets.component.scss"],
})
export class SupportTicketsComponent {
  public selectedChat: UserChatInfoDto;
  public noChats: boolean;

  public onSidebarVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.selectedChat = null;
    }
  }
}
