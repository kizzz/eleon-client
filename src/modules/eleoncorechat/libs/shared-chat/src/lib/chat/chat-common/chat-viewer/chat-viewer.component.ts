import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  Optional,
  Inject,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { CHAT_MODULE_CONFIG } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-chat-viewer",
  templateUrl: "./chat-viewer.component.html",
  styleUrls: ["./chat-viewer.component.scss"],
})
export class ChatViewerComponent implements OnChanges {

  showManagementModal: boolean = false;

  @Input()
  chat: UserChatInfoDto;
  @Output()
  chatChange = new EventEmitter<UserChatInfoDto>();

  @Output()
  onBackClicked = new EventEmitter<void>();

  @Input()
  noChats: boolean = false;

  @Input()
  showClose: boolean = false;

  showedTags: string[] = [];
  showMoreTags: boolean = false;

  @Input()
  sideBarView: boolean = false;

  public currentUserId: string;

  constructor(private config: IApplicationConfigurationManager,
    @Inject(CHAT_MODULE_CONFIG) @Optional() private chatConfig: any
  ) {
    this.currentUserId = this.config.getAppConfig().currentUser?.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.showedTags = this.getShowingTags(this.chat.chat?.tags || []);
    }
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
    if (this.chat?.chat?.chatMembersPreview.length > 5){
      return this.chat?.chat?.chatMembersPreview.slice(0, 5).map((x) => x.id);
    }
    return this.chat?.chat?.chatMembersPreview.map((x) => x.id); 
  }

  public membersAmount() {
    return this.chat?.chat?.membersAmount;
  }

  isMobileVersion(): boolean {
    return window.innerWidth <= 576;
  }

  onBack(){
    this.onBackClicked.emit();
    this.chat = null;
    this.chatChange.emit(this.chat);
  }

  getShowingTags(tags: string[]): string[] {
    const maxTagsCount = this.sideBarView ? (this.chatConfig?.chatTitle?.maxSidebarTagsCount || 2) : (this.chatConfig?.chatTitle?.maxTagsCount || 5);

    if (tags && tags.length > maxTagsCount){
      this.showMoreTags = true;
      return [...tags.slice(0, maxTagsCount)];
    }
    return tags.slice(0, maxTagsCount);
  }
}
