import { Component, EventEmitter, HostBinding, Inject, Input, OnChanges, Optional, Output, SimpleChanges } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import {
  ChatMemberRole,
  ChatRoomType,
} from '@eleon/collaboration-proxy';
import { CHAT_MODULE_CONFIG } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-chat-title",
  templateUrl: "./chat-title.component.html",
  styleUrls: ["./chat-title.component.scss"],
})
export class ChatTitleComponent implements OnChanges {


  constructor(@Inject(CHAT_MODULE_CONFIG) @Optional() private config: any) {
    this.showChannelBadge = this.config?.chatList?.showChannelBadge ?? true;
  }

  showedTags: string[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] || changes['maxTagsCount']) {
      this.showedTags = this.getShowingTags(this.chat?.chat?.tags || []);
    }
  }
  public showRenameModal: boolean = false;

  public get showRenameButton(): boolean {
    return (
      this.showRename &&
      this.chat.chat.type === ChatRoomType.Group &&
      (this.chat.userRole === ChatMemberRole.Administrator ||
        this.chat.userRole === ChatMemberRole.Owner)
    );
  }

  @Input()
  chat: UserChatInfoDto;

  @Input()
  showRename: boolean = false;

  @Input()
  showSupport: boolean = false;

  @Output()
  onBackClicked = new EventEmitter<void>();

  @Input()
  maxWidth: string;

  @Input()
  fullView = false;

  @Input()
  sideBarView = false;

  showChannelBadge: boolean = false;

  public get showSupportTag(): boolean {
    return (
      this.showSupport && this.chat.chat.type === ChatRoomType.SupportTicket
    );
  }

  public renameChat(): void {
    this.showRenameModal = true;
  }

  public onBack(){
    this.onBackClicked.emit();
  }

  getShowingTags(tags: string[]): string[] {
    const maxTagsCount = this.sideBarView ? (this.config?.chatTitle?.maxSidebarTagsCount || 2) : (this.config?.chatTitle?.maxTagsCount || 5);

    if (tags && tags.length > maxTagsCount){
      return [...tags.slice(0, maxTagsCount), '...'];
    }
    return tags.slice(0, maxTagsCount);
  }
}
