import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog'
import { TenantSelectionBoxComponent } from './tenant-table-box'
import { PROXY_SERVICES } from '@eleon/identity-querying.lib';

@NgModule({
  declarations: [
    TenantSelectionBoxComponent
  ],
  imports: [
    SharedModule,
    TableModule,
    InputTextModule,
    DialogModule,
    PopoverModule,
    ButtonModule,
    ResponsiveTableModule,
    FormsModule,
    TooltipModule,
    ProfilePictureModule,
    DynamicDialogModule
  ],
  exports: [
    TenantSelectionBoxComponent
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class TenantSelectionModule { }

