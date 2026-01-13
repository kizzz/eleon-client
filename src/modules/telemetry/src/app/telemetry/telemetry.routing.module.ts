import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TelemetryDashboardComponent } from './telemetry-dashboard/telemetry-dashboard.component'

const routes: Routes = [
  {
    path: 'dashboard', 
    component: TelemetryDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      name:"TenantManagement::Telemetry:Menu",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TelemetryRoutingModule { }
