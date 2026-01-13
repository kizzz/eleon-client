import { Injectable } from "@angular/core";
import { ChatMessageHelperService } from "./chat-message-helper.service";
import { ChatHubService } from "./chat-hub.service";
import { ISoundsService } from '@eleon/angular-sdk.lib'

@Injectable({
  providedIn: "root",
})
export class ChatSoundsService {
  private enabled: boolean = true;
  constructor(
    private soundService: ISoundsService,
    private chatHubService: ChatHubService,
    private msgHelper: ChatMessageHelperService
  ) {
    this.listenPushes();
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  private listenPushes(): void {
    this.chatHubService.messageReceived$.subscribe((msg) => {
      if (!this.enabled) return;

      const isOutcoming = this.msgHelper.isOutcoming(msg.message);
      const shouldPlay = !isOutcoming;
      if (shouldPlay) {
        this.soundService.play("notification-pop");
      }
    });
  }
}
