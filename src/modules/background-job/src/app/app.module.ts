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

export const remoteRoutes: Route[] = [
  {
    path: 'background-job',
    loadChildren: () =>
      import('./background-job/background-job.module').then(
        (r) => r.BackgroundJobModule
      ),
  },
];

export const menu = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  {
    routerLink: undefined,
    label: 'JobScheduler::AdminMenu:Top',

    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-cogs',
    order: 6,
    requiredPolicy: 'Permission.JobSchedule.General',
  },
  {
    routerLink: '/background-job/dashboard',
    label: 'BackgroundJob::Menu:Top',
    parentName: 'JobScheduler::AdminMenu:Top',
    icon: 'fas fa-cogs',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || Permission.BackgroundJob.General',
  }
]

export const providers = [
  provideAssetsOnInitialization([
    `${
      window.location.protocol + '//' + window.location.host
    }/modules/administration/styles.css`,
  ]),
  provideMenuOnInitialization(menu),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=BackgroundJob`,
  ),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}