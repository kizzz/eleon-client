import { Injectable } from "@angular/core";
import { ChatMemberType, UserChatInfoDto } from '@eleon/collaboration-proxy';
import { BehaviorSubject, Observable, takeUntil, timer } from "rxjs";
import { LatestChatsService } from '../chat-common'

export interface OpenedChat {
  chat: UserChatInfoDto;
  isMember: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ChatWidgetFlyoutService {
  private opened = new BehaviorSubject<boolean>(false);
  public opened$ = this.opened.asObservable();

  public selected$ = new BehaviorSubject<OpenedChat>(null);

  constructor(
    private latestChatService: LatestChatsService
  ) {

  }

  public toggle() {
    this.opened.next(!this.opened.value);
  }

  public openById(chatId: string){
    if (chatId) {
      this.latestChatService.loadChatById(chatId)
        .subscribe(chat => {
          if (chat) {
            this.selected$.next({ chat, isMember: chat.memberType !== ChatMemberType.Undefined });
            this.opened.next(true);
          }
        });
    }
  }

  public openWithTags(tags: string[]) {
    this.latestChatService.refresh({ tags: tags });
    this.opened.next(true);
  }

  public open(chat: UserChatInfoDto = null, isMember = true) {
    this.opened.next(true);
    if (chat) this.selected$.next({ chat, isMember });
  }

  public close() {
    this.opened.next(false);
  }

  public setState(isOpened: boolean) {
    this.opened.next(isOpened);
  }
}
