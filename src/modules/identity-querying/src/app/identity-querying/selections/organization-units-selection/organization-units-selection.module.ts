import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationUnitsSelectionTreeComponent } from './organization-units-selection-tree/organization-units-selection-tree.component';
import { TreeModule } from 'primeng/tree';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PROXY_SERVICES } from '@eleon/identity-querying.lib';
@NgModule({
  declarations: [
    OrganizationUnitsSelectionTreeComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    ButtonModule,
    TreeModule,
    SelectModule,
    TreeSelectModule,
    CheckboxModule,
    InputTextModule,
    TagModule,
    TreeTableModule,
    DialogModule,
    TooltipModule,
    ProfilePictureModule,
    RequiredMarkModule,
    DynamicDialogModule
  ],
  exports: [
    OrganizationUnitsSelectionTreeComponent
  ],
  providers: [...PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))]
})
export class OrganizationUnitsSelectionModule { }
