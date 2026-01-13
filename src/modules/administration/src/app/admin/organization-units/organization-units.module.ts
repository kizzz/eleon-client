import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { OrganizationUnitsDashboardComponent } from './organization-units-dashboard/organization-units-dashboard.component';
import { RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { ProfilePictureModule, ResponsiveTableModule, TextSelectionModule } from '@eleon/primeng-ui.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { OrganizationUnitsLocalCreateComponent } from './organization-units-local-create/organization-units-local-create.component';
import { IdentityExtendedModule } from '../identity-extended/identity-extended.module';
import { OrganizationUnitsCloneComponent } from './shared/organization-units-clone/organization-units-clone.component';
import { OrganizationUnitsCreateComponent } from './shared/organization-units-create/organization-units-create.component'
import { OrganizationUnitsMoveComponent } from './shared/organization-units-move/organization-units-move.component'
import { OrganizationUnitsEditComponent } from './shared/organization-units-edit/organization-units-edit.component'
import { OrganizationUnitsSelectionTreeComponent } from './shared/organization-units-selection-tree/organization-units-selection-tree.component';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { TagModule } from 'primeng/tag';
import { DynamicDialogModule } from 'primeng/dynamicdialog';


@NgModule({
  declarations: [
    OrganizationUnitsDashboardComponent,
    OrganizationUnitsLocalCreateComponent,
    OrganizationUnitsCloneComponent,
    OrganizationUnitsCreateComponent,
    OrganizationUnitsMoveComponent,
    OrganizationUnitsEditComponent,
    OrganizationUnitsSelectionTreeComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: OrganizationUnitsDashboardComponent,
        data:{
          name:"Infrastructure::OrganizationUnits",
          parentNames:"Infrastructure::Identities",
          mainParentName: "AbpUiNavigation::Menu:Administration",
        }
      }
    ]),
    TextSelectionModule,
    PageTitleModule,
    CardModule,
    ScrollPanelModule,
    ButtonModule,
    DialogModule,
    // CompanySelectionModule,
    TabsModule,
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
    DynamicDialogModule,
    CheckboxModule,
    InputTextModule,
    ResponsiveTableModule,
    ButtonModule,
    TableModule,
    OrganizationChartModule,
    TooltipModule,
    IdentityExtendedModule
  ]
})
export class OrganizationUnitsModule { }
