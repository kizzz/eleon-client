import { Component } from "@angular/core";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ChatCommonModule, ChatWidgetModule } from "src/modules/chat/libs/shared-chat/src";
import { LatestChatsService } from "src/modules/chat/libs/shared-chat/src";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  standalone: true,
  imports: [
    SharedModule,
    ButtonModule,
    TooltipModule,
    ChatWidgetModule,
		ChatCommonModule,
  ],
  styleUrl: "./chat.component.scss",
})
export class ChatComponent {
  opened: boolean = false;

  public get unreadCount() {
    return this.latestChatsService.unreadCount();
  }

  constructor(
    private latestChatsService: LatestChatsService) {}
}
