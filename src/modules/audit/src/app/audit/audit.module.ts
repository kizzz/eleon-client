import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditHistoryBoxComponent } from './audit-history-box/audit-history-box.component';
import { AuditHistoryDialogComponent } from './audit-history-dialog/audit-history-dialog.component';
import { AuditVersionWarningComponent } from './audit-version-warning/audit-version-warning.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog'
import { PROXY_SERVICES } from '@eleon/auditor-proxy'

@NgModule({
  declarations: [
    AuditHistoryBoxComponent,
    AuditHistoryDialogComponent,
    AuditVersionWarningComponent,
  ],
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    SharedModule,
    ButtonModule,
    InputTextModule,
    ResponsiveTableModule,
    AccordionModule,
    TooltipModule,
    MessageModule,
    DynamicDialogModule
  ],
  exports: [
    AuditHistoryDialogComponent,
    AuditVersionWarningComponent,
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class AuditModule {}
