import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () =>
  //     import('./home-page/home-page.module').then(
  //       (m) => m.HomePageModule
  //     ),

  //   canActivate: [EcAuthGuard, PermissionGuard],
  //   data: {
  //     policyKey: '',
  //   },
  // },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: 'organization-units',
    loadChildren: () =>
      import('./organization-units/organization-units.module').then(
        (m) => m.OrganizationUnitsModule
      ),

    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      policyKey: '',
    },
  },
	{
		path: 'api-keys',
		loadChildren: () => import('./api-key/api-key.module').then((m) => m.ApiKeyModule),
		canActivate: [EcAuthGuard, PermissionGuard],
	},
  // {
  //   path: "notification-settings",
  //   loadChildren: () =>
  //     import("./notification-settings/notification-settings.module").then(
  //       (m) => m.NotificationSettingsModule
  //     ),
  //   canActivate: [EcAuthGuard, PermissionGuard],
  // },
  {
    path: 'tenant-settings',
    loadChildren: () =>
      import('./tenant-settings/tenant-settings.module').then(
        (m) => m.TenantSettingsModule
      ),
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
    },
  },
  // {
  //   path: 'permission-management',
  //   loadChildren: () =>
  //     import('./permission-management/permission-management.module').then(
  //       (m) => m.PermissionManagementModule
  //     ),
  //   canActivate: [EcAuthGuard, PermissionGuard],
  // },
  // {
  //   path: 'features-management',
  //   loadChildren: () =>
  //     import('./features-management/features-management.module').then(
  //       (m) => m.FeaturesManagementModule
  //     ),
  //   canActivate: [EcAuthGuard, PermissionGuard],
  // },
  {
    path: 'identity',
    loadChildren: () =>
      import('./identity-extended/identity-extended.module').then(
        (m) => m.IdentityExtendedModule
      ),

    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      policyKey: '',
    },
  },
	{
		path: 'currencies',
		loadChildren: () => import('./currency-management/currency-management.module').then((m) => m.CurrencyManagementModule),
		canActivate: [EcAuthGuard, PermissionGuard],
	},
  // {
  //   path: "document-lifecycle",
  //   loadChildren: () =>
  //     import("@vportal-ui/shared-lifecycle").then(
  //       (m) => m.DocumentLifecycleModule
  //     ),
  //   canActivate: [EcAuthGuard, PermissionGuard],
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
