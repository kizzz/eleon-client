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
import { VPortalMenuItem } from "@eleon/angular-sdk.lib"
import { Route } from '@angular/router';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { ApplicationManagementComponent } from './application-management/application-management.component';
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
    ...provideMultipleOnInitialization(provideIdentityQuerying()),
  ],
})
export class AppModule { }
