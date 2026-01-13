import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from '@angular/forms'

import { RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { PageTitleModule } from '@eleon/primeng-ui.lib'
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib'
import { ButtonModule } from "primeng/button"
import { DatePickerModule } from "primeng/datepicker"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from 'primeng/inputtext'
import { TableModule } from "primeng/table"
import { CheckboxModule } from 'primeng/checkbox'
import { NotificationsModule } from './notifications/notifications.module'
import { NotificationsRoutingModule } from './notifications-routing.module'


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    SharedModule,
    PageTitleModule,
    TableModule,
    ResponsiveTableModule,
    DatePickerModule,
    ButtonModule,
    DialogModule,
    RequiredMarkModule,
    InputTextModule,
		CheckboxModule,
    NotificationsModule,
    FormsModule,
  ],
  providers: [
    
  ]
})
export class UserNotificationsModule {}
