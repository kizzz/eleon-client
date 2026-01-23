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
import { extractApiBase } from '@eleon/angular-sdk.lib';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
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
import { QueuesManagementComponent } from './system-queue/queues-management/queues-management.component'
import { PROXY_SERVICES } from '@eleon/event-management-proxy'

export const remoteRoutes: Route[] = [
  {
    path: 'system-queue/queue-management',
    component: QueuesManagementComponent,
    data: {
      name: "EventManagementModule::SystemEvents:Queues"
    }
  },
];

const allRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  {
    label: 'EventManagementModule::SystemEvents:Queues',
    routerLink: '/system-queue/queue-management',
    parentName: DefaultParentMenuItems.System, // 'TenantManagement::HostAdministration', //'EventManagementModule::SystemEvents',
    icon: 'fas fa-database',
    order: 7,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];

export const providers = [
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=EventManagementModule`
  ),
  ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}
