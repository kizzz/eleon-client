import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsDashboardComponent } from './notifications-dashboard/notifications-dashboard.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { ToastModule } from 'primeng/toast'
import { NotificationDetailsDialogComponent } from './notification-details-dialog/notification-details-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@NgModule({
  declarations: [
    NotificationsDashboardComponent,
    NotificationDetailsDialogComponent
  ],
  imports: [
    NotificationsRoutingModule,
    CommonModule,
    SharedModule,
    TableModule,
    TextareaModule,
    ButtonModule,
    PageTitleModule,
    ResponsiveTableModule,
    DatePickerModule,
    DialogModule,
    ToastModule
  ],
  exports:[
    NotificationsDashboardComponent,
    NotificationDetailsDialogComponent
  ]
})
export class NotificationsModule { }
