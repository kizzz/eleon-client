import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { setRemoteDefinitions } from '@nx/angular/mf';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  Component,
  importProvidersFrom,
} from '@angular/core';
import {
  EcAuthGuard,
  extractApiBase,
  PermissionGuard,
  provideEcContainerComponentOnInitialization,
} from '@eleon/angular-sdk.lib';
import {   
  IApplicationConfigurationManager,
  IVPortalMenuService, } from '@eleon/angular-sdk.lib';
import {
  DefaultParentMenuItems,
  VPortalMenuItem,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import {
  provideAssetsOnInitialization,
  provideInitializationComponent,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
  loadEleoncoreRemoteModule,
} from '@eleon/angular-sdk.lib';
import { CommonModule } from '@angular/common';
import {
  CHAT_MODULE_CONFIG,
  DEFAULT_CHAT_MODULE_CONFIG,
} from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES as ELEONCORE_MULTI_TENANCY_PROXY_SERVICES } from '@eleon/eleoncore-multi-tenancy-proxy';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';

export const remoteRoutes: Route[] = [
  {
    path: 'tenant-management',
    loadChildren: () =>
      import('./tenant-management/tenant-management.module').then(
        (m) => m.TenantManagementModule
      ),
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      policyKey: '',
    },
  },
  {
    path: 'tenant-settings',
    loadChildren: () =>
      import('./tenant-management/tenant-management.module').then(
        (m) => m.TenantManagementModule
      ),
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      policyKey: '',
    },
  },
];

export const providers = [
  provideMenuOnInitialization([], configureAdminMenu, [
    IVPortalMenuService,
    IApplicationConfigurationManager,
    CHAT_MODULE_CONFIG,
  ]),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=TenantManagement&localizationResources=AbpUiMultiTenancy`,
  ),
  ...provideMultipleOnInitialization(provideIdentityQuerying()),
  ...provideMultipleOnInitialization(ELEONCORE_MULTI_TENANCY_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}

const allRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.Administration,
    icon: 'pi pi-cog',
    order: 6,
  },

  {
    routerLink: '/tenant-settings/domains',
    label: 'TenantManagement::TenantSettings:Menu:HostnameSettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-globe',
    order: 6,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
];

export function configureAdminMenu(
  routes: IVPortalMenuService,
  config: IApplicationConfigurationManager,
  chatCfg: any
) {
  return () => {
    routes.addRange(allRoutes);

    console.log('Tenant Menu choosing...');
    console.log(config.getAppConfig().extraProperties?.['IsRoot']);
    console.log(config.getAppConfig().extraProperties?.['IsDefault']);
    if (
      config.getAppConfig().extraProperties?.['IsRoot'] ||
      config.getAppConfig().extraProperties?.['IsDefault']
    ) {
      routes.add({
        label: 'Infrastructure::TenantManagement:Header:Title',
        routerLink: '/tenant-management',
        parentName: DefaultParentMenuItems.Administration,
        icon: 'fa-solid fa-briefcase',
        order: 4,
        requiredPolicy: 'AbpTenantManagement.Tenants',
      });
    }
  };
}
