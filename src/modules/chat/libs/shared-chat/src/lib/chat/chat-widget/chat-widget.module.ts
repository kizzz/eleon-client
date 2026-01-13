import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatWidgetFlyoutComponent } from "./chat-widget-flyout/chat-widget-flyout.component";
import { ChatWidgetFlyoutButtonComponent } from "./chat-widget-flyout-button/chat-widget-flyout-button.component";
import { ChatCommonModule } from "../chat-common/chat-common.module";
import { ButtonModule } from "primeng/button";
import { ChatWidgetDropdownComponent } from "./chat-widget-dropdown/chat-widget-dropdown.component";
import { TooltipModule } from "primeng/tooltip";
import { PopoverModule } from "primeng/popover";
import { DrawerModule } from "primeng/drawer";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { ToggleButtonModule } from 'primeng/togglebutton';

@NgModule({
  declarations: [
    ChatWidgetFlyoutComponent,
    ChatWidgetFlyoutButtonComponent,
    ChatWidgetDropdownComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChatCommonModule,
    ButtonModule,
    TooltipModule,
    PopoverModule,
    DrawerModule,
		ToggleButtonModule
  ],
  exports: [
		ToggleButtonModule,
    ChatWidgetFlyoutComponent,
    ChatWidgetFlyoutButtonComponent,
    ChatWidgetDropdownComponent,
  ],
})
export class ChatWidgetModule {}
