import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectionBoxComponent } from './user-table-box/user-table-box.component';
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
import { PROXY_SERVICES } from '../proxy';

@NgModule({
  declarations: [
    UserSelectionBoxComponent
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
    UserSelectionBoxComponent
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class UserSelectionModule { }

