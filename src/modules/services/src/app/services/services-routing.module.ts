import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import { ServicesDashboardComponent } from './services-dashboard/services-dashboard.component'
import { ServicesDetailsComponent } from './services-details/services-details.component'

const routes: Routes = [
  {
    path: 'dashboard', 
		component: ServicesDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name: "ServicesModule::Dashboard:Title",
      mainParentName: "AbpUiNavigation::Menu:Administration",

    }
  },
  {
    path: 'details/:id', 
		component: ServicesDetailsComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name: "ServicesModule::Details",
      parentNames: "ServicesModule::Dashboard:Title",
      mainParentName: "AbpUiNavigation::Menu:Administration",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
