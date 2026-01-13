import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlDelegationRoutingModule } from './control-delegation-routing.module';
import { ControlDelegationListComponent } from './control-delegation-list/control-delegation-list.component';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule, SharedTableModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';
import { ControlDelegationByUserComponent } from './control-delegation-by-user/control-delegation-by-user.component';
import { ControlDelegationCreationDialogComponent } from './control-delegation-creation-dialog/control-delegation-creation-dialog.component';
import { ControlDelegationToUserComponent } from './control-delegation-to-user/control-delegation-to-user.component';
import { TableCellsModule } from '@eleon/primeng-ui.lib';
import { ControlDelegationComponent } from './control-delegation/control-delegation.component';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { DatePickerComponent } from './date-picker';

@NgModule({
  declarations: [
    ControlDelegationListComponent,
    ControlDelegationByUserComponent,
    ControlDelegationCreationDialogComponent,
    ControlDelegationToUserComponent,
    ControlDelegationComponent,
    DatePickerComponent,
  ],
  imports: [
    CommonModule,
    ControlDelegationRoutingModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TabsModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    PageTitleModule,
    ResponsiveTableModule,
    RequiredMarkModule,
    DialogModule,
    TableCellsModule,
    ProfilePictureModule,
    SharedTableModule
  ],
  exports:[
    ControlDelegationToUserComponent,
    ControlDelegationByUserComponent
  ]
})
export class ControlDelegationModule { }
