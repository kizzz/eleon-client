import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesDashboardComponent } from './templates-dashboard.component';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';

const routes: Routes = [
  {
    path: "notifications",
    component: TemplatesDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      titleKey: "Templating::Dashboard:Notifications:Title",
      createTitleKey: "Templating::TemplatesDashboard:CreateTemplateTitle",
      editTitleKey: "Templating::TemplatesDashboard:EditTemplateTitle",
      pageKey: 'notifications',
    },
  },
  {
    path: "actionslibrary",
    component: TemplatesDashboardComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      titleKey: "Templating::Dashboard:ActionsLibrary:Title",
      createTitleKey: "Templating::Dashboard:ActionsLibrary:CreateAction",
      editTitleKey: "Templating::Dashboard:ActionsLibrary:EditAction",
      pageKey: 'actionslibrary',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesDashboardRoutingModule { }
