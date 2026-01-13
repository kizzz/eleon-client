import { PageTitleModule } from '@eleon/primeng-ui.lib';

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RequiredMarkModule, SharedModule as SharedCoreModule } from '@eleon/angular-sdk.lib'
import { SharedModule } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { SplitButtonModule } from 'primeng/splitbutton'
import { TableModule } from 'primeng/table'
import { UserSessionsTableComponent } from './user-sessions-table/user-sessions-table.component'
import { UserSessionsComponent } from './user-sessions/user-sessions.component'
import { DialogModule } from 'primeng/dialog'
import { FormsModule } from '@angular/forms'
import { CheckboxModule } from 'primeng/checkbox'
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib'
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';

@NgModule({
  declarations: [
    UserSessionsTableComponent,
		UserSessionsComponent,
  ],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    SplitButtonModule,
    SharedModule,
    SharedCoreModule,
    PageTitleModule,
    ResponsiveTableModule,
    DialogModule,
    RequiredMarkModule,
		CheckboxModule,
    FormsModule,
    PanelModule,
    BadgeModule,
  ],
  exports: [
    UserSessionsTableComponent,
		UserSessionsComponent,
  ]
})
export class UserSessionsModule {  

}
