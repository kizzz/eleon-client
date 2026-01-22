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
  IProvidersService,
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
import { PROXY_SERVICES as PROVIDERS_PROXY_SERVICES } from '@eleon/providers-proxy';
import { ProvidersService } from './providers/services/providers.service'

export const remoteRoutes: Route[] = [
  {
    path: 'storage',
    loadChildren: () =>
      import('./providers/storage.module').then(
        (r) => r.StorageModule
      ),
  },
];


const storageRoutes: VPortalMenuItem[] = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.System,

    icon: 'pi pi-cog',
    order: 7,
  },
  {
    label: 'StorageModule::Menu:Top',
    parentName: DefaultParentMenuItems.System,

    icon: 'fas fa-hdd',
    order: 5,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
  {
    routerLink: '/storage/providers-options/list',
    label: 'StorageModule::Menu:ProvidersOptions',
    parentName: 'StorageModule::Menu:Top',
    icon: 'fas fa-hdd',
    order: 1,
    requiredPolicy: 'VPortal.Dashboard.Host || VPortal.Dashboard.Tenant',
  },
];


export const providers = [
  provideMenuOnInitialization(storageRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=StorageModule`,
  ),
  ...provideMultipleOnInitialization(PROVIDERS_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  provideOnInitialization(
    {
      provide: IProvidersService,
      useClass: ProvidersService
    }
  )
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}