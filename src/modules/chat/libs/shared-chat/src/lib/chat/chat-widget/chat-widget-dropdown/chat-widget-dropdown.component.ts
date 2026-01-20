import {
  Component,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  effect,
  OnDestroy,
} from "@angular/core";
import { ChatWidgetFlyoutService } from "../chat-widget-flyout.service";
import { Popover } from "primeng/popover";
import { LatestChatsService } from '../../chat-common'
import { Subscription } from 'rxjs';
import { ChatInteractionService, ChatRoomType, UserChatInfoDto } from "../../../proxy";

@Component({
  standalone: false,
  selector: "app-chat-widget-dropdown",
  templateUrl: "./chat-widget-dropdown.component.html",
  styleUrls: ["./chat-widget-dropdown.component.scss"],
})
export class ChatWidgetDropdownComponent implements OnDestroy {
  chats: UserChatInfoDto[] = [];
  
  @ViewChild(Popover) overlayPanel: Popover;

  public chatCreationDialogOpened = false;
  @Output()
  viewAllChatClickEvent = new EventEmitter<boolean>();
  chatsLimit: number = 4;
  
  private loadingChats = false;
  private loadChatsSubscription?: Subscription;
  constructor(
    private flyoutService: ChatWidgetFlyoutService,
    private chatsService: LatestChatsService,
    private chatService: ChatInteractionService,
  ) {
    effect(() => {
      const chats = this.chatsService.chats(); // triggers on any chats changes

      this.loadChats();
    })
  }

  ngOnInit(): void {
    this.loadChats();
  }

  private loadChats(): void {
    // Cancel any pending request to prevent parallel calls
    if (this.loadChatsSubscription) {
      return;
    }

    // Prevent parallel requests
    if (this.loadingChats) {
      return;
    }

    this.loadingChats = true;
    this.loadChatsSubscription = this.chatService.getLastChatsByRequest({
      skip: 0,
      take: this.chatsLimit,
      nameFilter: undefined,
      chatRoomTypes: [ChatRoomType.Group, ChatRoomType.Private],
      isArchived: false,
      isChannel: false,
      tags: [] // todo: tags from config or route
    }).subscribe({
      next: (res) => {
        this.chats = res.items;
        this.loadingChats = false;
        this.loadChatsSubscription = undefined;
      },
      error: () => {
        this.loadingChats = false;
        this.loadChatsSubscription = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadChatsSubscription) {
      this.loadChatsSubscription.unsubscribe();
    }
  }

  public onSelectedChatChange(chat: UserChatInfoDto): void {
    this.flyoutService.open(chat);
    this.overlayPanel.hide();
  }

  public onCreate(): void {
    this.chatCreationDialogOpened = true;
  }

  public toggle(event: any) {
    this.overlayPanel.toggle(event);
  }

  viewAllChatClicked() {
    this.viewAllChatClickEvent.emit(true);
  }

  triggerLinkClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('a')) {
      const link = document.querySelector('a[routerLink="/collaboration/chats"]');
      if (link) {
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    }
  }


}
