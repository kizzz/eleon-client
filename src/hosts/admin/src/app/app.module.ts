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
import { ecAppInitializer } from '@eleon/angular-hosting.lib';
import {
  createAssetsInitializer,
  createLocalizationInitializerUnified,
  createMenuInitializer,
  extractApiBase,
  provideBaseApi,
  provideInitializationComponent,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';
import { IApplicationConfigurationManager, IVPortalMenuService } from '@eleon/angular-sdk.lib';
import {
  DefaultParentMenuItems,
  VPortalMenuItem,
  LocalizationSchema
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AppModule as AppLayoutModule, } from 'src/modules/primeng-layout/src/app/eleonsoft.app.module';
import { AppLayoutModule as InternalLayoutModule } from 'src/modules/primeng-layout/src/app/layout/app.layout.module';
import { registerBasicProviders } from '@eleon/angular-hosting.lib';
import { AppComponent } from './app.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@vportal-ui/administration-module').then(
        (r) => r.AdministrationModule
      ),
  },
];

export const providers = [
  ...provideBaseApi([
    {
      apiName: 'eleoncore',
      apiBase: '/core',
    },
    {
      apiName: 'eleonsoft',
      apiBase: '/adminsrv',
    },
    {
      apiName: 'eleonauth',
      apiBase: '/auth',
    }
  ]),
  ...registerBasicProviders(null, null, null, {
    clientApplication: {
      isAuthenticationRequired: true,
    },
    extraProperties: {
      extendFromServer: true,
    },
    applicationName: 'Admin',
  } as any),
  ...ecAppInitializer,
  // createAssetsInitializer([
  // 	`${window.location.protocol + '//' + window.location.host}/modules/administration/styles.css`,
  // ]),
  createMenuInitializer([], configureAdminMenu),
  createLocalizationInitializerUnified(
    LocalizationSchema.Ec,
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=Default&localizationResources=BlobStoringDatabase&localizationResources=VPortal&localizationResources=Identity&localizationResources=Otp&localizationResources=StorageModule&localizationResources=ExternalLink&localizationResources=FileManager&localizationResources=BackgroundJob&localizationResources=NotificatorModule&localizationResources=Auditor&localizationResources=Lifecycle&localizationResources=JobScheduler&localizationResources=Google&localizationResources=SystemLog&localizationResources=Collaboration&localizationResources=Cms&localizationResources=TenantManagement&localizationResources=AccountingModule&localizationResources=GatewayManagement&localizationResources=LanguageManagement&localizationResources=EventManagementModule&localizationResources=AbpUiMultiTenancy&localizationResources=HealthCheckModule`
  ),
  importProvidersFrom(
    MonacoEditorModule.forRoot({
      baseUrl: '/apps/admin/assets',
    })
  ),
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, // for root
    // RouterModule,
    // HttpClientModule,
    AppLayoutModule,
    InternalLayoutModule,
    // CommonModule, // for child if using module as lazy loaded
    RouterModule.forRoot(remoteRoutes), // for child if using module as lazy loaded,
  ],
  providers,
  bootstrap: [AppComponent],
})
export class AppModule {}

const systemLogsRoutes: VPortalMenuItem[] = [
  {
    routerLink: '/auditlog/dashboard/eventlogs',
    label: 'Infrastructure::SystemLogs:Menu:EventLogs',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/auditlog/dashboard/auditlogs',
    label: 'Infrastructure::SystemLogs:Menu:EntityChanges',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 2,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/auditlog/dashboard/requestlogs',
    label: 'Infrastructure::SystemLogs:Menu:AuditLogs',
    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/auditlog/dashboard/securitylogs',
    label: 'Infrastructure::SystemLogs:Menu:SecurityLogs',

    parentName: 'Infrastructure::SystemLogs:Menu:Top',
    icon: 'fas fa-list',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];
const languageRoutes: VPortalMenuItem[] = [
  {
    routerLink: '/language-management/languages',
    label: 'LanguageManagement::Menu:LanguageManagement',
    parentName: 'LanguageManagement::Menu:Top',

    icon: 'fas fa-language',
    order: 2,
    requiredPolicy: 'Permission.LanguageManagement.ManageLanguages',
  },
  {
    routerLink: '/language-management/localization-entries',
    label: 'LanguageManagement::Menu:LocalizationEntries',
    parentName: 'LanguageManagement::Menu:Top',

    icon: 'fas fa-language',
    order: 3,
    requiredPolicy: 'Permission.LanguageManagement.ManageLanguages',
  },
];

const accountingRoutes = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.Accounting,
    icon: 'pi pi-cog',
    order: 5,
    // requiredPolicy: "VPortal.Dashboard.Host || VPortal.Dashboard.Tenant || SuspendedAdmin",
  },
  {
    routerLink: undefined,
    label: 'AccountingModule::Reseller:Menu:Top',
    parentName: DefaultParentMenuItems.Accounting,
    icon: 'fa-solid fa-user-group',
    order: 1,
    //requiredPolicy: "Permission.Reseller.General && VPortal.Dashboard.Tenant",
  },
  {
    routerLink: '/account/resellerdashboard',
    label: 'AccountingModule::Reseller:Menu:Dashboard',
    parentName: 'AccountingModule::Reseller:Menu:Top',
    icon: 'fas fa-list',
    order: 1,
    //requiredPolicy: "Permission.Reseller.General && VPortal.Dashboard.Tenant",
  },
  {
    routerLink: '/account/reseller-create/',
    label: 'AccountingModule::Reseller:Menu:Create',
    parentName: 'AccountingModule::Reseller:Menu:Top',
    icon: 'fas fa-plus',
    order: 4,
    //requiredPolicy: "Permission.Reseller.Create && VPortal.Dashboard.Tenant",
  },
  {
    routerLink: '/account/account-info',
    label: 'AccountingModule::Menu:AccountInfo',
    parentName: DefaultParentMenuItems.Administration,
    icon: 'fas fa-user-alt',
    order: 10,
    //requiredPolicy: "VPortal.Dashboard.Tenant || SuspendedAdmin",
  },

  {
    routerLink: undefined,
    label: 'AccountingModule::Menu:Top',
    parentName: DefaultParentMenuItems.Accounting,
    icon: 'fas fa-user-alt',
    order: 4,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/dashboard',
    label: 'AccountingModule::Menu:Dashboard',
    parentName: 'AccountingModule::Menu:Top',
    icon: 'fas fa-list',
    order: 1,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/approval',
    label: 'AccountingModule::Menu:ApprovalList',
    parentName: 'AccountingModule::Menu:Top',
    icon: 'fas fa-check-double',
    order: 2,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/archive',
    label: 'AccountingModule::Menu:Archive',
    parentName: 'AccountingModule::Menu:Top',
    icon: 'fas fa-history',
    order: 3,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/create/',
    label: 'AccountingModule::Menu:Create',
    parentName: 'AccountingModule::Menu:Top',
    icon: 'fas fa-plus',
    order: 4,
    //requiredPolicy: "Permission.Account.Create && VPortal.Dashboard.Host",
  },
  {
    routerLink: undefined,
    label: 'AccountingModule::Menu:Management',
    parentName: 'AccountingModule::Menu:Top',
    icon: 'fa fa-users',
    order: 5,
    //requiredPolicy: "VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/packagetemplate/dashboard',
    label: 'AccountingModule::Menu:PackageTemplates',
    parentName: 'AccountingModule::Menu:Management',
    icon: 'fas fa-list',
    order: 1,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/document-lifecycle/account',
    label: 'AccountingModule::Menu:Lifecycle',
    parentName: 'AccountingModule::Menu:Management',
    icon: 'fa fa-users',
    order: 2,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/accountmodule/dashboard',
    label: 'AccountingModule::Menu:Modules',
    parentName: 'AccountingModule::Menu:Management',
    icon: 'fas fa-list',
    order: 4,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
];

const tenantSettingsRoutes: VPortalMenuItem[] = [
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
    routerLink: '/tenant-settings/notifications',
    label: 'TenantManagement::TenantSettings:Menu:NotificationSettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-envelope',
    order: 3,
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
    routerLink: '/tenant-settings/domains',
    label: 'TenantManagement::TenantSettings:Menu:HostnameSettings',
    parentName: 'TenantManagement::TenantSettings:Menu:Top',
    icon: 'fas fa-globe',
    order: 6,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
];
const identitiesRoutes: VPortalMenuItem[] = [
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
const jobsRoutes: VPortalMenuItem[] = [
  {
    routerLink: '/background-job/dashboard',
    label: 'BackgroundJob::Menu:Top',

    parentName: 'JobScheduler::AdminMenu:Top',
    icon: 'fas fa-cogs',
    order: 1,
    requiredPolicy:
      'VPortal.Dashboard.Host || Permission.BackgroundJob.General',
  },
  {
    routerLink: '/job-scheduler/tasks/list',
    parentName: 'JobScheduler::AdminMenu:Top',
    label: 'JobScheduler::Menu:Tasks',
    order: 2,
    icon: 'fas fa-list-check',
    requiredPolicy: 'VPortal.Dashboard.Host || Permission.JobSchedule.General',
  },
];
const storageRoutes: VPortalMenuItem[] = [
  {
    routerLink: '/storage/providers-options/list',
    label: 'StorageModule::Menu:ProvidersOptions',
    parentName: 'StorageModule::Menu:Top',
    icon: 'fas fa-hdd',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];
const adminRoutes: VPortalMenuItem[] = [
  {
    routerLink: undefined,
    label: 'Infrastructure::Identities',

    parentName: DefaultParentMenuItems.Administration,
    icon: 'fas fa-users',
    order: 1,
    requiredPolicy: 'AbpIdentity.Roles || AbpIdentity.Users',
  },
  ...identitiesRoutes,

  {
    routerLink: '/api-keys/dashboard',
    label: 'TenantManagement::ApiKey:Menu',
    parentName: DefaultParentMenuItems.Administration,
    icon: 'fas fa-key',
    order: 6,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },

  // {
  //   label: 'Infrastructure::Currency:Menu:Top',
  //   routerLink: '/currencies',
  //   parentName: DefaultParentMenuItems.Administration,
  //   icon: 'fa fa-money-bill',
  //   order: 12,
  //   requiredPolicy: 'Settings',
  // },

  // {
  //   label: "Infrastructure::Menu:Elsa",
  //   routerLink: "vportal/elsa",
  //   parentName: DefaultParentMenuItems.Administration,
  //   icon: "fas fa-cogs",
  //   order: 10,
  //   requiredPolicy: "CoreInfrastructure.Module.ElsaWorkflows",
  // },
  // {
  //   label: "Lifecycle::Lifecycles",
  //   routerLink: "/document-lifecycle",
  //   parentName: DefaultParentMenuItems.Administration,
  //   icon: "fa fa-cog",
  //   order: 12,
  //   requiredPolicy: "VPortal.Dashboard.Host || VPortal.Dashboard.Tenant",
  // },
];

const systemRoutes: VPortalMenuItem[] = [
  // {
  //   label: 'HealthCheckModule::AdminMenu:Top',
  //   routerLink: '/health-checks/dashboard',
  //   parentName: DefaultParentMenuItems.System,
  //   icon: 'fas fa-book-medical',
  //   order: 2,
  //   requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  // },

  {
    routerLink: undefined,
    label: 'Infrastructure::SystemLogs:Menu:Top',

    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-list-check',
    order: 3,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  ...systemLogsRoutes,

  {
    label: 'TenantManagement::Telemetry:Menu:Top',
    routerLink: '/telemetry/dashboard',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-solid fa-stethoscope',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    label: 'StorageModule::Menu:Top',
    parentName: DefaultParentMenuItems.System,

    icon: 'fas fa-hdd',
    order: 5,
    requiredPolicy: 'Permission.LanguageManagement.ManageLanguages',
  },
  ...storageRoutes,
  {
    routerLink: undefined,
    label: 'JobScheduler::AdminMenu:Top',

    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-cogs',
    order: 6,
    requiredPolicy: 'Permission.JobSchedule.General',
  },
  ...jobsRoutes,
  // {
  //   label: 'EventManagementModule::SystemEvents:Queues',
  //   routerLink: '/system-events/queues-management',
  //   parentName: DefaultParentMenuItems.System, // 'TenantManagement::HostAdministration', //'EventManagementModule::SystemEvents',
  //   icon: 'fas fa-database',
  //   order: 7,
  //   requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  // },
  {
    label: 'TenantManagement::TenantSettings:Menu:Top',
    routerLink: undefined,
    parentName: DefaultParentMenuItems.System,
    icon: 'fa fa-cog',
    order: 8,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  ...tenantSettingsRoutes,
  {
    label: 'LanguageManagement::Menu:Top',
    parentName: DefaultParentMenuItems.System,

    icon: 'fas fa-language',
    order: 9,
    requiredPolicy: 'Permission.LanguageManagement.ManageLanguages',
  },
  ...languageRoutes,
];

const commonRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.Administration,

    icon: 'pi pi-cog',
    order: 6,
  },
  ...adminRoutes,
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  ...systemRoutes,
  // {
  //   label: 'Infrastructure::EventLogs:Menu',
  //   routerLink: '/event-logs',
  //   parentName: 'TenantManagement::HostAdministration',
  //   icon: 'fa fa-file',
  //   order: 12,
  //   requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  // },

  // {
  //   label: "Infrastructure::Menu:ElsaWorkflows",
  //   routerLink: "vportal/elsa/definitions",
  //   parentName: "Infrastructure::Menu:Elsa",
  //   icon: "fas fa-cogs",
  //   order: 10,
  //   requiredPolicy: "VPortal.Dashboard.Host || VPortal.Dashboard.Tenant",
  // },
  // {
  //   label: "Infrastructure::Menu:ElsaInstances",
  //   routerLink: "vportal/elsa/instances",
  //   parentName: "Infrastructure::Menu:Elsa",
  //   icon: "fas fa-cogs",
  //   order: 10,
  //   requiredPolicy: "VPortal.Dashboard.Host || VPortal.Dashboard.Tenant",
  // },
];

const allRoutes: VPortalMenuItem[] = [
  ...commonRoutes,
  // ...accountingRoutes,
];

export function configureAdminMenu(
  routes: IVPortalMenuService,
  config: IApplicationConfigurationManager
) {
  return () => {
    routes.addRange(allRoutes);

    config.getAppConfig$().subscribe((cfg) => {
      console.log('Tenant Menu choosing...');
      console.log(config.getAppConfig().extraProperties?.['IsRoot']);
      console.log(config.getAppConfig().extraProperties?.['IsDefault']);
      if (
        cfg?.extraProperties?.['IsRoot'] ||
        cfg?.extraProperties?.['IsDefault']
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
    });
  };
}
