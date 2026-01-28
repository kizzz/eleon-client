import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiKeyTableBoxComponent } from '../api-key-table-box/api-key-table-box.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PROXY_SERVICES as TENANT_MANAGEMENT_PROXY_SERVICES } from '@eleon/tenant-management-proxy';

@NgModule({
  declarations: [
    ApiKeyTableBoxComponent
  ],
  imports: [
    SharedModule,
    TableModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    ResponsiveTableModule,
    FormsModule,
    TooltipModule,
    DynamicDialogModule,
    TagModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  exports: [
    ApiKeyTableBoxComponent
  ],
  providers: [...TENANT_MANAGEMENT_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class ApiKeySelectionModule { }
