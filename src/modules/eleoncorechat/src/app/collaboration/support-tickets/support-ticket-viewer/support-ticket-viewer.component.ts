import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { UserChatInfoDto } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-support-ticket-viewer",
  templateUrl: "./support-ticket-viewer.component.html",
  styleUrls: ["./support-ticket-viewer.component.scss"],
})
export class SupportTicketViewerComponent {
  @Input()
  chat: UserChatInfoDto;
  @Output()
  chatChange = new EventEmitter<UserChatInfoDto>();

  @Input()
  noChats: boolean = false;

  @Input()
  showClose: boolean = false;

  public currentUserId: string;

  constructor(private config: IApplicationConfigurationManager) {
    this.currentUserId = this.config.getAppConfig().currentUser?.id;
  }

  public onLeaveChat(): void {
    this.chat = null;
    this.chatChange.emit(this.chat);
  }

  public close(): void {
    this.chat = null;
    this.chatChange.emit(this.chat);
  }

  
  public getChatImages() {
    return this.chat?.chat?.chatMembersPreview.map((x) => x.id);
  }

  public membersAmount() {
    return this.chat?.chat?.membersAmount;
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }
}
