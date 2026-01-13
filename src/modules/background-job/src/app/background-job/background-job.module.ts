import { PanelModule } from 'primeng/panel';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ResponsiveTableModule, LoadingModule } from '@eleon/primeng-ui.lib';
import { AccordionModule } from 'primeng/accordion';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { BackgroundJobDashboardComponent } from './background-job-dashboard/background-job-dashboard.component';
import { BackgroundJobRoutingModule } from './background-job-routing.module';
import { BackgroundJobDetailsComponent } from './background-job-details/background-job-details.component';
import { DocumentTemplateEditorModule } from '@eleon/primeng-ui.lib';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { BackgroundJobStatusTagComponent } from './background-job-status-tag';
import { PROXY_SERVICES } from '@eleon/background-jobs-proxy';

@NgModule({
  declarations: [
    BackgroundJobDashboardComponent,
    BackgroundJobDetailsComponent,
    BackgroundJobStatusTagComponent
  ],
  imports: [
    CommonModule,
    BackgroundJobRoutingModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TabsModule,
    BadgeModule,
    LoadingModule,
    ResponsiveTableModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ChipModule,
    TooltipModule,
    MultiSelectModule,
    FileUploadModule,
    TagModule,
    PageTitleModule,
    PanelModule,
    ResponsiveTableModule,
    AccordionModule,
    RequiredMarkModule,
    DocumentTemplateEditorModule,
    MessageModule,
    PipesModule,
    DialogModule,
    TextareaModule
  ],
  providers: [PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class BackgroundJobModule { }
