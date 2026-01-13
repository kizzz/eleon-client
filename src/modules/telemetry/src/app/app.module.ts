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
} from '@eleon/angular-sdk.lib';

export const remoteRoutes: Route[] = [
  {
    path: 'telemetry',
    loadChildren: () =>
      import('./telemetry/telemetry.module').then(
        (r) => r.TelemetryModule
      ),
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
    label: 'TenantManagement::Telemetry:Menu:Top',
    routerLink: '/telemetry/dashboard',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-solid fa-stethoscope',
    order: 4,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];

export const providers = [
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=TenantManagement`
  ),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}