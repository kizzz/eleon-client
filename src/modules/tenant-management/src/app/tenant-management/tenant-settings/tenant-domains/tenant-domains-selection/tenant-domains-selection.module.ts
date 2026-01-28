import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantDomainsTableBoxComponent } from '../tenant-domains-table-box/tenant-domains-table-box.component';
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
import { PROXY_SERVICES as ELEONCORE_MULTI_TENANCY_PROXY_SERVICES } from '@eleon/eleoncore-multi-tenancy-proxy';

@NgModule({
  declarations: [
    TenantDomainsTableBoxComponent
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
    TenantDomainsTableBoxComponent
  ],
  providers: [...ELEONCORE_MULTI_TENANCY_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class TenantDomainsSelectionModule { }
