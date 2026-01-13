import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplatesDashboardComponent } from './templates-dashboard.component';
import { TemplatesDashboardRoutingModule } from './templates-dashboard-routing.module';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { CreateTemplateDialogComponent } from './create-template-dialog/create-template-dialog.component';
import { CreateTemplateDialogHeaderComponent } from './create-template-dialog/create-template-dialog-header.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { TreeSelectModule } from 'primeng/treeselect';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { ActionTemplatesSelectionDialogComponent } from './action-templates-selection-dialog/action-templates-selection-dialog';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule } from '@eleon/angular-sdk.lib';
import { LocalizationModule } from '@eleon/angular-sdk.lib';
import { RawEditorModule } from '@eleon/primeng-ui.lib';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    TemplatesDashboardComponent,
    CreateTemplateDialogComponent,
    CreateTemplateDialogHeaderComponent,
    ActionTemplatesSelectionDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TemplatesDashboardRoutingModule,
    PageTitleModule,
    RawEditorModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    LocalizationModule,
    CheckboxModule,
    ChipModule,
    TagModule,
    TooltipModule,
    MessageModule,
    TreeSelectModule,
    RequiredMarkModule,
    ResponsiveTableModule,
    DynamicDialogModule,
  ],
  exports: [
    TemplatesDashboardRoutingModule,
    TemplatesDashboardComponent,
    CreateTemplateDialogComponent,
    ActionTemplatesSelectionDialogComponent,
  ],
  providers: [DialogService],
})
export class TemplatesDashboardModule {}
