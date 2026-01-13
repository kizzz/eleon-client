import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import { ApiKeyManagementComponent } from './api-key-management/api-key-management.component'

const routes: Routes = [
  {
    path: 'dashboard', component: ApiKeyManagementComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name:"TenantManagement::ApiKey:Menu",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiKeyRoutingModule { }
