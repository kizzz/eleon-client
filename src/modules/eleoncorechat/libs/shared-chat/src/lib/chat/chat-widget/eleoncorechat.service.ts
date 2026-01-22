import { Injectable } from '@angular/core';

import { ChatWidgetFlyoutService } from './chat-widget-flyout.service'
import { Router } from '@angular/router'

import { IChatService } from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: 'root'
})
export class EleoncoreChatService extends IChatService {

  constructor(private chatWidgetService: ChatWidgetFlyoutService, private router: Router) {
    super();
    
}

  public openChat(chatId: string, fullPage: boolean): Promise<void> {
    if (fullPage){
      return this.router.navigate(['/collaboration/chats'], { queryParams: { chat: chatId }}).then(() => {});
    }
    else{
      this.chatWidgetService.openById(chatId);
      return Promise.resolve();
    }
  }

  public openSidebar(): Promise<void> {
    this.chatWidgetService.open();
    return Promise.resolve();
  }
  public closeSidebar(): Promise<void> {
    this.chatWidgetService.close();
    return Promise.resolve();
  }
}