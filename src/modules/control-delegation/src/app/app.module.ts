import { NgModule } from '@angular/core';
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

import { ILocalizationService, IVPortalUserMenuService } from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES } from '@eleon/control-delegation-proxy';

export const remoteRoutes: Route[] = [
  {
    path: 'control-delegation',
    loadChildren: () =>
      import('./control-delegation/control-delegation.module').then(
        (r) => r.ControlDelegationModule
      ),
  },
];

const allRoutes: VPortalMenuItem[] = [];

export const providers = [
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=Default&localizationResources=BlobStoringDatabase&localizationResources=VPortal&localizationResources=Identity&localizationResources=Otp&localizationResources=StorageModule&localizationResources=ExternalLink&localizationResources=FileManager&localizationResources=BackgroundJob&localizationResources=NotificatorModule&localizationResources=Auditor&localizationResources=Lifecycle&localizationResources=JobScheduler&localizationResources=Google&localizationResources=SystemLog&localizationResources=Collaboration&localizationResources=Cms&localizationResources=TenantManagement&localizationResources=LanguageManagement&localizationResources=AbpUiMultiTenancy`
  ),
  ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  provideOnInitialization({
    provide: APP_INITIALIZER,
    useFactory: (userMenuService: IVPortalUserMenuService, localizationService: ILocalizationService) => {
      return () => {
        userMenuService.addUserMenuItem(
          {
            label: localizationService.instant(
              'Infrastructure::ControlDelegation:Menu:Top'
            ),
            icon: 'pi pi-users mr-2 w-2rem text-center',
            routerLink: '/control-delegation',
            order: 3,
            visible: true,
            parentName: 'UserSideBar',
            expand: false,
          },
        );
      }
    },
    deps: [IVPortalUserMenuService, ILocalizationService],
    multi: true,
  })
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}

