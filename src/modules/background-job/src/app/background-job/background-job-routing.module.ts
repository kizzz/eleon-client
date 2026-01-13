import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import { BackgroundJobDashboardComponent } from './background-job-dashboard/background-job-dashboard.component';
import { BackgroundJobDetailsComponent } from './background-job-details/background-job-details.component';

const routes: Routes = [
  {
    path: 'dashboard', component: BackgroundJobDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      policyKey: 'Permission.BackgroundJob.General',
      name: "BackgroundJob::Dashboard:Title",
      parentNames: "JobScheduler::AdminMenu:Top",
      mainParentName: "AbpUiNavigation::Menu:Administration",

    }
  },
  {
    path: 'details/:id', component: BackgroundJobDetailsComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      policyKey: 'Permission.BackgroundJob.General',
      name: "BackgroundJob::Details",
      parentNames: "JobScheduler::AdminMenu:Top;BackgroundJob::Menu:Top",
      mainParentName: "AbpUiNavigation::Menu:Administration",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackgroundJobRoutingModule { }
