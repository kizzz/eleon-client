import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NotificationSettingsComponent } from "./notification-settings/notification-settings.component";
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ButtonModule } from "primeng/button";
import { NotificationTypeSettingsComponent } from "./notification-type-settings/notification-type-settings.component";
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [
    NotificationSettingsComponent,
    NotificationTypeSettingsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ButtonModule,
    PageTitleModule,
    CheckboxModule
  ],
  exports: [NotificationSettingsComponent],
})
export class NotificationSettingsModule {}
