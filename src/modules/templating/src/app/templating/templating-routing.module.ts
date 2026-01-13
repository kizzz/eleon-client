import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./templates-dashboard/templates-dashboard.module').then(m => m.TemplatesDashboardModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatingRoutingModule { }
