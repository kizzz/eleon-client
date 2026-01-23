import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import { AccountDashboardComponent } from './account/account-dashboard/account-dashboard.component';
import { AccountListRequestType } from '@eleon/accounting-proxy';
import { PackageTemplatesDashboardComponent } from './package-template/package-templates-dashboard/package-templates-dashboard.component';
import { AccountCreateComponent } from './account/account-create/account-create.component';
import { PackageTemplateCreateComponent } from './package-template/package-template-create/package-template-create.component';

const routes: Routes = [
  {path: 'create', redirectTo: 'create/', pathMatch: 'full'},
  {
    path: 'create/:id', component: AccountCreateComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      module: 'Account',
      policyKey: 'Permission.Account.Create && VPortal.Dashboard.Host',
      name: "AccountingModule::Menu:Account",
      parentNames: "AccountingModule::Menu:Top",
      mainParentName: "Infrastructure::Accounting"
    }
  },
  {
    path: 'details/:id', component: AccountCreateComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      module: 'Account',
      policyKey: 'Permission.Account.General && VPortal.Dashboard.Host',
      name: "AccountingModule::Menu:AccountDetails",
      parentNames: "AccountingModule::Menu:Top",
      mainParentName: "Infrastructure::Accounting"
    }
  },
  {
    path: 'dashboard', component: AccountDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      requestType: AccountListRequestType.EnRoute,
      module: 'Account',
      policyKey: 'Permission.Account.General && VPortal.Dashboard.Host',
      name: "AccountingModule::Menu:Dashboard",
      parentNames: "AccountingModule::Menu:Top",
      mainParentName: "Infrastructure::Accounting"
    }
  },
  {
    path: 'approval', component: AccountDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requestType: AccountListRequestType.ActionRequired,
      module: 'Account',
      policyKey: 'Permission.Account.Default',
      name: "AccountingModule::Menu:ApprovalList",
      parentNames: "AccountingModule::Menu:Top",
      mainParentName: "Infrastructure::Accounting"
    }
  },
  {
    path: 'archive', component: AccountDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requestType: AccountListRequestType.Archive,
      module: 'Account',
      policyKey: 'Permission.Account.Default',
      name: "AccountingModule::Menu:Archive",
      mainParentName: "Infrastructure::Accounting",
      parentNames: "AccountingModule::Menu:Top",
    }
  },
  {
    path: 'packagetemplate',
    children: [
      {
        path: 'dashboard',
        component: PackageTemplatesDashboardComponent,
        data: {
          name: "AccountingModule::Menu:PackageTemplates",
          mainParentName: "Infrastructure::Accounting",
          parentNames: "AccountingModule::Menu:Top;AccountingModule::Menu:Management",
        }
      },
      {path: 'create', redirectTo: 'create/', pathMatch: 'full'},
      {
        path: 'create/:id', component: PackageTemplateCreateComponent,
        canActivate: [EcAuthGuard, PermissionGuard],
        canDeactivate: [CanDeactivateDirtyGuard],
        data: {
          name: "AccountingModule::Create",
          parentNames: "AccountingModule::Menu:Top;AccountingModule::Menu:Management;AccountingModule::Menu:PackageTemplates",
          mainParentName: "Infrastructure::Accounting"
        }
      },
      {
        path: 'details/:id', component: PackageTemplateCreateComponent,
        canActivate: [EcAuthGuard, PermissionGuard],
        canDeactivate: [CanDeactivateDirtyGuard],
        data: {
          name: "AccountingModule::Details",
          parentNames: "AccountingModule::Menu:Top;AccountingModule::Menu:Management;AccountingModule::Menu:PackageTemplates",
          mainParentName: "Infrastructure::Accounting"
        }
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,]
})
export class AccountingRoutingModule { }
