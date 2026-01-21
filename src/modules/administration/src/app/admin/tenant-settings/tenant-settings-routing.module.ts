import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsManagementComponent } from './settings-management/settings-management.component';
import { CanDeactivateDirtyGuard } from '@eleon/primeng-ui.lib';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'general',
  },
  {
    path: 'general',
    component: SettingsManagementComponent,
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: 'general',
      tab: 0,
      name: 'TenantManagement::TenantSettings:Menu:GeneralSettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
      policyKey: 'Settings',
    },
  },
  {
    path: 'telemetry',
    component: SettingsManagementComponent,
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: 'telemetry',
      tab: 1,
      name: 'TenantManagement::TenantSettings:Menu:TelemetrySettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
      policyKey: 'Settings',
    },
  },
  {
    path: 'identity',
    component: SettingsManagementComponent,
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: 'identity',
      tab: 3,
      name: 'TenantManagement::TenantSettings:Menu:IdentitySettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
      policyKey: 'Settings',
    },
  },
  {
    path: 'time-zone',
    component: SettingsManagementComponent,
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: 'time-zone',
      tab: 4,
      name: 'TenantManagement::TenantSettings:Menu:TimeZoneSettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
      policyKey: 'Settings',
    },
  },
  {
    path: 'appearance',
    component: SettingsManagementComponent,
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      type: 'appearance',
      tab: 5,
      name: 'TenantManagement::TenantSettings:Menu:AppearanceSettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
      policyKey: 'Settings',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantSettingsRoutingModule {}
