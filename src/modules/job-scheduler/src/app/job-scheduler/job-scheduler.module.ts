import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobSchedulerRoutingModule } from './job-scheduler-routing.module';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { ListboxModule } from 'primeng/listbox';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TriggerSettingsComponent } from './trigger-management/trigger-settings/trigger-settings.component';
import { TriggerNextRuntimesComponent } from './trigger-management/trigger-nextruntimes/trigger-nextruntimes.component';
import { TaskListComponent } from './task-management/task-list/task-list.component';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TaskDetailsComponent } from './task-management/task-details/task-details.component';
import { TaskHistoryComponent } from './task-management/task-history/task-history.component';
import { LocalizationModule, PipesModule, SharedModule } from '@eleon/angular-sdk.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib'
import { ResponsiveTableModule, SharedTableModule, TextSelectionModule } from '@eleon/primeng-ui.lib'
import { MenuModule } from 'primeng/menu'
import { ToastModule } from 'primeng/toast'
import { PasswordModule } from 'primeng/password'
import { OrganizationChartModule } from 'primeng/organizationchart'
import { FileUploadModule } from 'primeng/fileupload'
import { ActionSettingsComponent } from './action-management/action-settings/action-settings.component'
import { ChipModule } from 'primeng/chip'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { RawEditorModule } from '@eleon/primeng-ui.lib'
import { PROXY_SERVICES } from '@eleon/job-scheduler-proxy'

@NgModule({
  declarations: [
    TriggerSettingsComponent,
    TriggerNextRuntimesComponent,
		ActionSettingsComponent,
    TaskDetailsComponent,
    TaskListComponent,
    TaskHistoryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    JobSchedulerRoutingModule,
    SharedModule,
    LocalizationModule,
    PipesModule,
    PageTitleModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    CheckboxModule,
    InputNumberModule,
    DividerModule,
    RadioButtonModule,
    DatePickerModule,
    PanelModule,
    MultiSelectModule,
    ToggleSwitchModule,
    TextareaModule,
    TabsModule,
    DialogModule,
    ListboxModule,
    TooltipModule,
    TagModule,
    MessageModule,
    TextSelectionModule,
    ResponsiveTableModule,
    MenuModule,
    ToastModule,
    SharedTableModule,
    PasswordModule,
    OrganizationChartModule,
    FileUploadModule,
    ChipModule,
    InputGroupModule,
    InputGroupAddonModule,
    RawEditorModule
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class JobSchedulerModule { }
