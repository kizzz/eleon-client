import { MultiSelectModule } from 'primeng/multiselect';
import { LifecycleReportPage } from './lifecycle-flows/lifecycle-report-page/lifecycle-report-page.component';
import { LifecycleReportDetailsDialogComponent } from './lifecycle-flows/lifecycle-report-page/lifecycle-report-details-dialog';
import { StateActorTemplateSelectionModule } from './state-actor-template-selection/state-actor-template-selection.module';
import { DialogModule } from 'primeng/dialog';
import { NgModule } from '@angular/core';
import { LifecycleStatesTemplatesManagementComponent } from './lifecycle-states-templates-management';
import { LifecycleStateActorsTemplatesManagementComponent } from './lifecycle-state-actors-templates-management';
import {
  LifecycleStatesGroupsTemplatesManagementComponent,
  LifecycleStatesGroupsTemplatesManagementDetailsComponent,
  LifecycleStatesGroupsTemplatesManagementTableComponent,
} from './lifecycle-states-groups-templates-management';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { OrderListModule } from 'primeng/orderlist';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LifecycleRoutingModule } from './lifecycle-routing.module';
import { LifecycleFlowsPage } from './lifecycle-flows';
import { PageTitleModule, ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { EllipsisComponent, LocalizationModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib';
import { CommonModule } from '@angular/common';
import { LifecycleTraceModule } from './lifecycle/lifecycle-trace';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

@NgModule({
  declarations: [
    LifecycleStatesGroupsTemplatesManagementComponent,
    LifecycleStatesGroupsTemplatesManagementDetailsComponent,
    LifecycleStatesGroupsTemplatesManagementTableComponent,
    LifecycleStateActorsTemplatesManagementComponent,
    LifecycleFlowsPage,
    LifecycleReportPage,
    LifecycleReportDetailsDialogComponent,
    LifecycleStatesTemplatesManagementComponent,
  ],
  imports: [
    CommonModule,
    TagModule,
    SharedModule,
    ButtonModule,
    SelectButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    FormsModule,
    TabsModule,
    TableModule,
    TagModule,
    AccordionModule,
    SelectModule,
    CheckboxModule,
    PageTitleModule,
    LocalizationModule,
    LifecycleRoutingModule,
    OrderListModule,
    LifecycleTraceModule,
    ResponsiveTableModule,
    BadgeModule,
    ProgressSpinnerModule,
    StateActorTemplateSelectionModule,
    RadioButtonModule,
    CommonModule,
    SharedModule,
    DatePickerModule,
    InputTextModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    SelectModule,
    MultiSelectModule,
    PageTitleModule,
    ResponsiveTableModule,
    RequiredMarkModule,
    SelectButtonModule,
    ToggleSwitchModule,
    FormsModule,
    TabsModule,
    TagModule,
    OrderListModule,
    BadgeModule,
    ProgressSpinnerModule,
    StateActorTemplateSelectionModule,
    RadioButtonModule,
    DialogModule,
  ],
  exports: [
    LifecycleStatesGroupsTemplatesManagementComponent,
    LifecycleStatesGroupsTemplatesManagementDetailsComponent,
    LifecycleStatesGroupsTemplatesManagementTableComponent,
    LifecycleStateActorsTemplatesManagementComponent,
    LifecycleStatesTemplatesManagementComponent,
  ],
})
export class LifecylceModule {}

