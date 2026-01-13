import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { DocumentTemplateEditorModule } from '@eleon/primeng-ui.lib';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MultiSelectModule } from 'primeng/multiselect'
import { PanelModule } from 'primeng/panel';
import { SystemLogRoutingModule } from './system-log.routing.module'
import { SharedModule as SharedCoreModule } from '@eleon/angular-sdk.lib';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CheckboxModule } from 'primeng/checkbox';
import {
  AuditLogsPageComponent,
  RequestLogsPageComponent,
  SecurityLogsPageComponent,
  SystemAlertsPageComponent,
  SystemLogsPageComponent,
  UserSecurityLogsPageComponent,
} from './logs-dashboard/logs-dashboard.component'
import { DynamicDialogModule } from 'primeng/dynamicdialog'
import { SystemLogsOverlayComponent } from './system-logs/system-logs-menu.component'
import { SystemLogDetailsDialogComponent } from './system-log-details-dialog/system-log-details-dialog.component'
import { SystemLogTableComponent } from './system-log-table/system-log-table.component'
import { RippleModule } from 'primeng/ripple'
import { ChipModule } from 'primeng/chip';
import { MessageModule } from 'primeng/message';
import { UserSecurityLogsComponent } from './security-logs/user-security-logs.component'
import { AuditLogDetailsComponent } from './audit-log-details/audit-log-details.component'
import { AuditLogsTableComponent } from './audit-logs-table/audit-logs-table.component'
import { EntityChangesTableComponent } from './entity-changes-table/entity-changes-table.component'

@NgModule({
  declarations: [
    SystemLogsPageComponent,
    SystemAlertsPageComponent,
    SystemLogDetailsDialogComponent,
    SystemLogTableComponent,
    
    AuditLogsPageComponent,
    RequestLogsPageComponent,
    SecurityLogsPageComponent,
    UserSecurityLogsPageComponent,
    UserSecurityLogsComponent,
    AuditLogDetailsComponent,
    AuditLogsTableComponent,
    EntityChangesTableComponent,
  ],
  imports: [
    CommonModule,
    SystemLogRoutingModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TabsModule,
    BadgeModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    SelectModule,
    TagModule,
    PageTitleModule,
    ResponsiveTableModule,
    RequiredMarkModule,
    DialogModule,
    FormsModule,
    DocumentTemplateEditorModule,
    InputGroupModule,
    InputGroupAddonModule,
    MultiSelectModule,
    PanelModule,
    DynamicDialogModule,
    RippleModule,
    SplitButtonModule,
    SharedCoreModule,
		CheckboxModule,
    ChipModule,
    MessageModule
  ],
  exports: [
    SystemLogDetailsDialogComponent
  ]
})
export class SystemLogModule { }
