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
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { MessageModule } from 'primeng/message';
import { ApiKeyRoutingModule } from './api-key.routing.module';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { DocumentTemplateEditorModule } from '@eleon/primeng-ui.lib';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ApiKeyManagementComponent } from './api-key-management/api-key-management.component'
import { IdentityExtendedModule } from '../identity-extended/identity-extended.module'
import { CheckboxModule } from 'primeng/checkbox'
import { ApiKeySelectionModule } from './api-key-selection/api-key-selection.module'

@NgModule({
  declarations: [
    ApiKeyManagementComponent
  ],
  imports: [
    CommonModule,
    ApiKeyRoutingModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TabsModule,
    BadgeModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ChipModule,
    TooltipModule,
    SelectModule,
    TagModule,
    PageTitleModule,
    ResponsiveTableModule,
    RequiredMarkModule,
    MessageModule,
    DialogModule,
    FormsModule,
    DocumentTemplateEditorModule,
    InputGroupModule,
    InputGroupAddonModule,
		CheckboxModule,
		DatePickerModule,
		IdentityExtendedModule,
		ApiKeySelectionModule
  ]
})
export class ApiKeyModule { }
