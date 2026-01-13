import { NgModule } from '@angular/core';
import { RoleSelectionBoxComponent } from './role-table-box/role-table-box.component';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { InputTextModule } from 'primeng/inputtext';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PROXY_SERVICES } from '../proxy';



@NgModule({
  declarations: [
    RoleSelectionBoxComponent
  ],
  imports: [
    SharedModule,
    TableModule,
    ResponsiveTableModule,
    PopoverModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    DynamicDialogModule
  ],
  exports: [
    RoleSelectionBoxComponent
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class RoleSelectionModule { }

