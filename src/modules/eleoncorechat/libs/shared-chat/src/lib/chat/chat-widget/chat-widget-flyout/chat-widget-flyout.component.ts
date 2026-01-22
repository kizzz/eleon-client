import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ChatWidgetFlyoutService } from "../chat-widget-flyout.service";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { BehaviorSubject, debounceTime } from "rxjs";
import { ChatRoomType } from '@eleon/collaboration-proxy';
import { Router } from '@angular/router'
import { ChatListComponent } from '../../chat-common'

@Component({
  standalone: false,
  selector: "app-chat-widget-flyout",
  templateUrl: "./chat-widget-flyout.component.html",
  styleUrls: ["./chat-widget-flyout.component.scss"],
})
export class ChatWidgetFlyoutComponent implements OnInit {
  selectedChat: UserChatInfoDto;
  opened: boolean;
  isMember: boolean;
  
  constructor(
		private flyoutService: ChatWidgetFlyoutService,
    private el: ElementRef,
		private router: Router,
    ) {
    this.flyoutService.opened$.subscribe((opened) => {
      this.opened = opened;
    });
  }

  public onSidebarVisibilityChange(visible: boolean): void {
    this.flyoutService.setState(visible);
  }

  public get showBack(): boolean {
    // if (this.selectedChat.chat.type === ChatRoomType.DocumentConversation) {
    //   return this.isMember;
    // }

    return true;
  }

  public get showRename(): boolean {
    // if (this.selectedChat.chat.type === ChatRoomType.DocumentConversation) {
    //   return false;
    // }

    return true;
  }

  public close(): void {
    this.flyoutService.close();
  }

  public ngOnInit(): void {
    this.flyoutService.selected$.subscribe((chat) => {
      if (!chat?.chat) {
        return;
      }
      this.selectedChat = chat.chat;
      this.isMember = chat.isMember;
    });
  }

  public onBack(): void {
    this.selectedChat = null;
    this.flyoutService.selected$.next(null);
  }

  get position() {
    const element = this.el.nativeElement.closest('[dir="ltr"]');
    if (element) {
        return "right";
    } 
    return "left";
	}

	navigateToFullPage()	{
		this.flyoutService.close();
		if (this.selectedChat) {
			this.router.navigate(['/collaboration/chats'], {
				queryParams: { chat: this.selectedChat.chat.id, }
			});
		}
		else {
			this.router.navigate(['/collaboration/chats']);
		}
	}
}
