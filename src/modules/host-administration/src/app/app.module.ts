import { NgModule } from '@angular/core';
import {
  extractApiBase,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
} from '@eleon/angular-sdk.lib';
import { LocalizationSchema } from '@eleon/angular-sdk.lib';
import { RouterModule, Routes } from '@angular/router';
import { PROXY_SERVICES } from '@eleon/sites-management-proxy'
import { PROXY_SERVICES as TENANT_MANAGEMENT_PROXY_SERVICES } from '@eleon/tenant-management-proxy';
import { VPortalMenuItem } from "@eleon/angular-sdk.lib"
import { Route } from '@angular/router';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { ApplicationManagementComponent } from './application-management/application-management.component';
import { FeaturesManagementDashboardComponent } from './features-management/features-management-dashboard/features-management-dashboard.component';
import { PermissionManagementDashboardComponent } from './permission-management/permission-management-dashboard/permission-management-dashboard.component';
import { ApplicationsDashboardComponent } from './application-management/applications-dashboard/applications-dashboard.component';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';

export const remoteRoutes: Route[] = [
  {
    path: 'sites/application-management',
    component: ApplicationManagementComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'Permission.HostAdministration',
      type: "application-management",
      name: "TenantManagement::Applications",
      parentNames: 'TenantManagement::Sites',
    }
  },
  {
    path: 'sites/modules-management',
    component: ApplicationManagementComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'Permission.HostAdministration',
      type: "modules-management",
      name: "TenantManagement::Modules",
      parentNames: 'TenantManagement::Sites'
    }
  },
  {
    path: 'sites/resources-management',
    component: ApplicationManagementComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requiredPolicy: 'Permission.HostAdministration',
      type: "resources-management",
      name: "TenantManagement::Resources",
      parentNames: 'TenantManagement::Sites'
    }
  },
	{
		path: 'applications',
		component: ApplicationsDashboardComponent,
		canActivate: [EcAuthGuard, PermissionGuard],
		data: {
			requiredPolicy: 'Permission.HostAdministration',
			name: "TenantManagement::Applications",
			parentNames: 'TenantManagement::HostAdministration',
		}
	},
  {
    path: 'features-management',
    component: FeaturesManagementDashboardComponent,
    data: {
      name: "TenantManagement::Features"
    }
  },
  {
    path: 'permission-management',
    component: PermissionManagementDashboardComponent,
    data: {
      name: "TenantManagement::Permissions"
    }
  },
];


export const hostAdministrationRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: 'TenantManagement::HostAdministration',
    requiredPolicy: 'Permission.HostAdministration',
    icon: "pi pi-cog",
    order: 8,
  },
  {
    routerLink: null,
    label: 'TenantManagement::Sites',
    parentName: 'TenantManagement::HostAdministration',
    icon: "fa-solid fa-globe",
    order: 7,
  },
	{
    routerLink: 'applications',
    label: 'TenantManagement::Apps',
    parentName: 'TenantManagement::Sites',
    icon: "fa-solid fa-globe",
    order: 11,
  },
  {
    label: "TenantManagement::Applications",
    routerLink: "/sites/application-management",
    parentName: 'TenantManagement::Sites',
    icon: "fa-regular fa-newspaper",
    order: 12,
  },
  {
    label: "TenantManagement::Modules",
    routerLink: "/sites/modules-management",
    parentName: 'TenantManagement::Sites',
    icon: "fa-solid fa-puzzle-piece",
    order: 13,
  },
  {
    label: "TenantManagement::Resources",
    routerLink: "/sites/resources-management",
    parentName: 'TenantManagement::Sites',
    icon: "fa-solid fa-database",
    order: 14,
  },
  {
    label: 'TenantManagement::PermissionManagement:Header:Title',
    routerLink: '/permission-management',
    parentName: 'TenantManagement::HostAdministration',
    icon: 'fas fa-cog',
    order: 14,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    label: 'TenantManagement::FeatureManagement:Header:Title',
    routerLink: '/features-management',
    parentName: 'TenantManagement::HostAdministration',
    icon: 'fas fa-cog',
    order: 15,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];


@NgModule({
  declarations: [
  ],
  imports: [
      RouterModule.forChild(remoteRoutes)
  ],
  exports: [RouterModule],
  providers: [
    provideMenuOnInitialization(hostAdministrationRoutes),
		provideLocalizationOnInitialization(
      (culture) => `${extractApiBase('eleoncore')}/api/abp/application-localization?cultureName=${culture}`,
      LocalizationSchema.Abp,
    ),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    ...provideMultipleOnInitialization(TENANT_MANAGEMENT_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    ...provideMultipleOnInitialization(provideIdentityQuerying()),
  ],
})
export class AppModule { }
