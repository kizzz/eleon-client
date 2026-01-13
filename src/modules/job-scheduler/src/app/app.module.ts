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
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DefaultParentMenuItems } from '@eleon/angular-sdk.lib'

export const remoteRoutes: Route[] = [
  {
    path: 'job-scheduler',
    loadChildren: () =>
      import('./job-scheduler/job-scheduler.module').then(
        (r) => r.JobSchedulerModule
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
    routerLink: '/job-scheduler/tasks/list',
    parentName: 'JobScheduler::AdminMenu:Top',
    label: 'JobScheduler::Menu:Tasks',
    order: 2,
    icon: 'fas fa-list-check',
    requiredPolicy: 'VPortal.Dashboard.Host || Permission.JobSchedule.General',
  },
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
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=JobScheduler`,
  ),
  provideOnInitialization(
    importProvidersFrom(
      MonacoEditorModule.forRoot({
        baseUrl: '/modules/job-scheduler/assets',
      })
    )
  ),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}