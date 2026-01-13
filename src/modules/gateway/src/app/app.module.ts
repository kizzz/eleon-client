import { NgModule } from '@angular/core';
import {
  extractApiBase,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
} from '@eleon/angular-sdk.lib';
import { LocalizationSchema } from '@eleon/angular-sdk.lib';
import { RouterModule, Routes } from '@angular/router';
import { Route } from '@angular/router';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import { VPortalMenuItem } from "@eleon/angular-sdk.lib"

export const remoteRoutes: Route[] = [
	{
    path: 'gateways',
    loadChildren: () =>
      import('./gateways/gateways.module').then((m) => m.GatewaysModule),
    canActivate: [EcAuthGuard, PermissionGuard],
  },
];


export const menu: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: 'TenantManagement::HostAdministration',
    requiredPolicy: 'Permission.HostAdministration',
    icon: "pi pi-cog",
    order: 8,
  },
  // {
  //   label: 'GatewayManagement::Menu:Gateways',
  //   routerLink: undefined,
  //   parentName: 'TenantManagement::HostAdministration',
  //   icon: 'fas fa-project-diagram',
  //   order: 4,
  //   requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  // },
  {
    label: 'GatewayManagement::Menu:Gateways',
    routerLink: '/gateways/gateways',
    parentName: 'TenantManagement::HostAdministration',
    icon: 'fas fa-project-diagram',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  // {
  //   label: 'GatewayManagement::Menu:EventBuses',
  //   routerLink: '/gateways/event-buses',
  //   parentName: 'TenantManagement::HostAdministration',
  //   icon: 'fas fa-stream',
  //   order: 4,
  //   requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  // },
];



@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes)
  ],
  exports: [RouterModule],
  providers: [
    provideMenuOnInitialization(menu),
		provideLocalizationOnInitialization(
      (culture) => `${extractApiBase('eleoncore')}/api/abp/application-localization?cultureName=${culture}`,
      LocalizationSchema.Abp,
    ),
  ],
})
export class AppModule { }
