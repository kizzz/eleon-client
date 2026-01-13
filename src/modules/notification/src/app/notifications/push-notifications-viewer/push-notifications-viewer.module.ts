import { NotificationsModule } from '../notifications/notifications.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationsViewerComponent } from './push-notifications-viewer.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PipesModule, SharedModule } from '@eleon/angular-sdk.lib';
import { NotificationMessageToastComponent } from '../notification-message-toast'
import { ToastModule } from 'primeng/toast'
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';


@NgModule({
  declarations: [
    PushNotificationsViewerComponent,
    NotificationMessageToastComponent,
  ],
  imports: [
    SharedModule,
    TableModule,
    CommonModule,
    PipesModule,
    ResponsiveTableModule,
    ButtonModule,
    NotificationsModule,
    TooltipModule,
    ToastModule,
    DialogModule
  ],
  exports: [
    PushNotificationsViewerComponent,
    NotificationMessageToastComponent
  ]
})
export class PushNotificationsViewerModule { }
