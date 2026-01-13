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
  DefaultParentMenuItems,
  VPortalMenuItem,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import {
  extractApiBase,
  provideAssetsOnInitialization,
  provideInitializationComponent,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';

export const remoteRoutes: Route[] = [
	{
		path: 'health-checks',
		loadChildren: () => import('./health-check/health-check.module').then((m) => m.HealthCheckModule),
	}
];

const allRoutes: VPortalMenuItem[] = [
  {
    label: 'HealthCheckModule::AdminMenu:Top',
    routerLink: '/health-checks/dashboard',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-book-medical',
    order: 2,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];

export const providers = [
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=HealthCheckModule`
  ),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}

