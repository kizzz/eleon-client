import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import { HealthCheckDashboardComponent } from './health-check-dashboard/health-check-dashboard.component'
import { HealthCheckDetailsComponent } from './health-check-details/health-check-details.component'

const routes: Routes = [
  {
    path: 'dashboard', 
		component: HealthCheckDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name: "HealthCheckModule::Dashboard:Title",
      mainParentName: "AbpUiNavigation::Menu:Administration",

    }
  },
  {
    path: 'details/:id', 
		component: HealthCheckDetailsComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name: "HealthCheckModule::Details",
      parentNames: "HealthCheckModule::Dashboard:Title",
      mainParentName: "AbpUiNavigation::Menu:Administration",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HealthCheckRoutingModule { }
