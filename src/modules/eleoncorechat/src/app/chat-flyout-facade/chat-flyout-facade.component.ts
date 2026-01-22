import { Component } from "@angular/core";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ChatWidgetModule } from "../../../libs/shared-chat/src/lib/chat/chat-widget/chat-widget.module";

@Component({
  selector: "app-chat-flyout-facade",
  template: "<app-chat-widget-flyout></app-chat-widget-flyout>",
  standalone: true,
  imports: [
    SharedModule,
    ButtonModule,
    TooltipModule,
    ChatWidgetModule,
  ],
})
export class ChatFlayoutFacadeComponent {
}
