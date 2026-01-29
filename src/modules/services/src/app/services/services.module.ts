import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule, SharedModule } from '@eleon/angular-sdk.lib';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { AccordionModule } from 'primeng/accordion';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { DocumentTemplateEditorModule } from '@eleon/primeng-ui.lib';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog'
import { TextareaModule } from 'primeng/textarea'
import { PROXY_SERVICES } from '@eleon/services-proxy'
import { ServicesRoutingModule } from './services-routing.module'
import { ServicesDashboardComponent } from './services-dashboard/services-dashboard.component'
import { ServicesDetailsComponent } from './services-details/services-details.component'
import { CheckboxModule } from 'primeng/checkbox'

@NgModule({
  declarations: [
    ServicesDashboardComponent,
    ServicesDetailsComponent,
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TabsModule,
    BadgeModule,
    ResponsiveTableModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ChipModule,
    CheckboxModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule,
    FileUploadModule,
    TagModule,
    PageTitleModule,
    ResponsiveTableModule,
    AccordionModule,
    RequiredMarkModule,
    DocumentTemplateEditorModule,
    MessageModule,
		PipesModule,
		DialogModule,
    TextareaModule
  ],
  providers: PROXY_SERVICES.map(s => ({ provide: s, useClass: s })),
})
export class ServicesModule { }
