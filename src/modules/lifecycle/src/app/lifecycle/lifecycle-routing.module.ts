import { LifecycleReportPage } from './lifecycle-flows/lifecycle-report-page/lifecycle-report-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { LifecycleFlowsPage } from './lifecycle-flows';

const routes: Routes = [
  {
    path: 'workflows',
    component: LifecycleFlowsPage,
    data: {
      name: 'Lifecycle::DashboardPage:Workflows:Title',
      parentNames: 'Lifecycle::Menu:Lifecycle',
    },
  },
  {
    path: 'reports',
    component: LifecycleReportPage,
    data: {
      name: 'Lifecycle::DashboardPage:Reports:Title',
      parentNames: 'Lifecycle::Menu:Lifecycle',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LifecycleRoutingModule {}
