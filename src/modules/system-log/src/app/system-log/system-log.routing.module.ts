import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';
import {
  AuditLogsPageComponent,
  RequestLogsPageComponent,
  SecurityLogsPageComponent,
  SystemAlertsPageComponent,
  SystemLogsPageComponent,
  UserSecurityLogsPageComponent,
} from './logs-dashboard/logs-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard/eventlogs', component: SystemLogsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "system",
      name:"Infrastructure::SystemLogs:Menu:EventLogs",
      parentNames:"Infrastructure::SystemLogs:Menu:Top"
    }
  },
  {
    path: 'dashboard/systemalerts', component: SystemAlertsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "systemalerts",
      name:"Infrastructure::SystemLogs:Menu:SystemAlerts",
      parentNames:"Infrastructure::SystemLogs:Menu:Top"
    }
  },
  {
    path: 'dashboard/auditlogs', component: AuditLogsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "audit",
      name:"Infrastructure::SystemLogs:Menu:EntityChanges",
      parentNames:"Infrastructure::SystemLogs:Menu:Top"
    }
  },
  {
    path: 'dashboard/requestlogs', component: RequestLogsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "requests",
      name:"Infrastructure::SystemLogs:Menu:AuditLogs",
      parentNames:"Infrastructure::SystemLogs:Menu:Top"
    }
  },
  {
    path: 'dashboard/securitylogs', component: SecurityLogsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "security",
      name:"Infrastructure::SystemLogs:Menu:SecurityLogs",
      parentNames:"Infrastructure::SystemLogs:Menu:Top"
    }
  },
  {
    path: 'dashboard/user-security-logs', 
    component: UserSecurityLogsPageComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: "security",
      name:"Infrastructure::SystemLogs:Menu:SecurityLogs",
      parentNames:"Infrastructure::SystemLogs:Menu:Top",
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemLogRoutingModule { }
