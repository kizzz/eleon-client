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
  extractApiBase,
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
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {
  CHAT_MODULE_CONFIG,
  DEFAULT_CHAT_MODULE_CONFIG,
} from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES as TENANT_MANAGEMENT_PROXY_SERVICES } from '@eleon/tenant-management-proxy';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./admin/administration.module').then(
        (r) => r.AdministrationModule
      ),
  },
];

const tenantSettingsRoutes: VPortalMenuItem[] = [
  {
    label: 'TenantManagement::TenantSettings:Menu:Top',
    routerLink: undefined,
    parentName: DefaultParentMenuItems.System,
    icon: 'fa fa-cog',
    order: 9,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    routerLink: '/tenant-settings/general',
    label: 'TenantManagement::TenantSettings:Menu:GeneralSettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-cog',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    routerLink: '/tenant-settings/telemetry',
    label: 'TenantManagement::TenantSettings:Menu:TelemetrySettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-satellite-dish',
    order: 2,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    routerLink: '/tenant-settings/identity',
    label: 'TenantManagement::TenantSettings:Menu:IdentitySettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-id-card',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    routerLink: '/tenant-settings/appearance',
    label: 'TenantManagement::TenantSettings:Menu:AppearanceSettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-paint-brush',
    order: 5,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    routerLink: '/tenant-settings/time-zone',
    label: 'TenantManagement::DisplayName:Timezone',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-globe',
    order: 7,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
];

const identitiesRoutes: VPortalMenuItem[] = [
  {
    routerLink: undefined,
    label: 'Infrastructure::Identities',

    parentName: DefaultParentMenuItems.Administration,
    icon: 'fas fa-users',
    order: 1,
    requiredPolicy: 'AbpIdentity.Roles || AbpIdentity.Users',
  },
  {
    routerLink: '/api-keys/dashboard',
    label: 'TenantManagement::ApiKey:Menu',
    parentName: DefaultParentMenuItems.Administration,
    icon: 'fas fa-key',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/organization-units',
    label: 'Infrastructure::OrganizationUnits',

    parentName: 'Infrastructure::Identities',
    icon: 'fa fa-sitemap',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    label: 'TenantManagement::Roles',
    routerLink: '/identity/roles',
    parentName: 'Infrastructure::Identities',

    icon: 'fas fa-user-tag',
    order: 2,
    requiredPolicy: 'AbpIdentity.Roles',
  },
  {
    label: 'TenantManagement::Users',
    routerLink: '/identity/users',
    parentName: 'Infrastructure::Identities',

    icon: 'fas fa-users',
    order: 1,
    requiredPolicy: 'AbpIdentity.Users',
  },
];

const allRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.Administration,

    icon: 'pi pi-cog',
    order: 6,
  },
  ...identitiesRoutes,
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  {
    label: 'TenantManagement::PermissionManagement:Header:Title',
    routerLink: '/permission-management',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-cog',
    order: 7,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    label: 'TenantManagement::FeatureManagement:Header:Title',
    routerLink: '/features-management',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-cog',
    order: 7,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  ...tenantSettingsRoutes,
];


export const providers = [
  provideAssetsOnInitialization([
    `${
      window.location.protocol + '//' + window.location.host
    }/modules/administration/styles.css`,
  ]),
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=Default&localizationResources=BlobStoringDatabase&localizationResources=VPortal&localizationResources=Identity&localizationResources=Otp&localizationResources=StorageModule&localizationResources=ExternalLink&localizationResources=FileManager&localizationResources=NotificatorModule&localizationResources=Auditor&localizationResources=Lifecycle&localizationResources=Google&localizationResources=Collaboration&localizationResources=Cms&localizationResources=TenantManagement&localizationResources=AbpUiMultiTenancy`,
  ),
  provideOnInitialization(
    importProvidersFrom(
      MonacoEditorModule.forRoot({
        baseUrl: '/modules/administration/assets',
      })
    )
  ),
  provideOnInitialization({
    provide: CHAT_MODULE_CONFIG,
    useFactory: () => {
      return {
        ...DEFAULT_CHAT_MODULE_CONFIG,
        routes: [
          {
            title: 'Collaboration::HelpDesk',
            parentName: DefaultParentMenuItems.Administration,
            order: 5,
            icon: 'fas fa-flag',
            route: '/support',
            tags: ['support'],
          },
        ],
      };
    },
  }),
  ...provideMultipleOnInitialization(TENANT_MANAGEMENT_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}