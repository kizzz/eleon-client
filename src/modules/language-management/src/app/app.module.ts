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
import { PROXY_SERVICES as LANGUAGE_MANAGEMENT_PROXY_SERVICES } from '@eleon/language-management-proxy';

export const remoteRoutes: Route[] = [
  {
    path: 'language-management',
    loadChildren: () =>
      import('./language-management/language-management.module').then(
        (r) => r.LanguageManagementModule
      ),
  },
];

export const menu: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
   {
    label: 'LanguageManagement::Menu:Top',
    parentName: DefaultParentMenuItems.System,
    icon: 'fas fa-language',
    order: 10,
    requiredPolicy: 'Permission.LanguageManagement.ManageLanguages',
  },
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
]

export const providers = [
  
  provideMenuOnInitialization(menu),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=LanguageManagement`,
  ),

  ...provideMultipleOnInitialization(LANGUAGE_MANAGEMENT_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}
