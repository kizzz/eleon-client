import { NgModule } from '@angular/core';
import {
  importProvidersFrom,
} from '@angular/core';
import {
  extractApiBase,
  provideEcContainerComponentOnInitialization,
} from '@eleon/angular-sdk.lib';
import { ITemplatingDialogService } from '@eleon/angular-sdk.lib';
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
import { TemplatingDialogService } from './templating/templates-dashboard/services/templating-dialog.service';
import { PROXY_SERVICES as TEMPLATING_PROXY_SERVICES } from '@eleon/templating-proxy';

export const remoteRoutes: Route[] = [
  {
    path: 'templating',
    loadChildren: () =>
      import('./templating/templating.module').then(
        (r) => r.TemplatingModule
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
    label: 'Templating::ActionsLibrary:Menu:Top',
    routerLink: 'templating/dashboard/actionslibrary',
    parentName: 'JobScheduler::AdminMenu:Top',
    icon: 'fa fa-file-lines',
    order: 8,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
  {
    label: 'Templating::Notifications:Menu:Top',
    routerLink: 'templating/dashboard/notifications',
    parentName: DefaultParentMenuItems.System,
    icon: 'fa fa-file-lines',
    order: 8,
    requiredPolicy: 'VPortal.Dashboard.Host',
  },
];

export const providers = [
  provideMenuOnInitialization(menu),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Templating`,
  ),
  provideOnInitialization({
    provide: ITemplatingDialogService,
    useClass: TemplatingDialogService,
  }),

  ...provideMultipleOnInitialization(TEMPLATING_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}