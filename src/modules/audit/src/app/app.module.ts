import { NgModule } from '@angular/core';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  Component,
  importProvidersFrom,
} from '@angular/core';
import {
  extractApiBase,
  provideEcContainerComponentOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
  provideLocalizationOnInitialization
} from '@eleon/angular-sdk.lib';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import {
  DefaultParentMenuItems,
  VPortalMenuItem,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import { AuditDialogService } from './audit/services/audit-dialog.service'
import { IAuditDialogService } from '@eleon/angular-sdk.lib'
import { PROXY_SERVICES } from '@eleon/auditor-proxy';

export const remoteRoutes: Route[] = [
  {
    path: 'audit',
    loadChildren: () =>
      import('./audit/audit.module').then(
        (r) => r.AuditModule
      ),
  },
];

export const providers = [
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Auditor`
  ),
  provideOnInitialization({
    provide: IAuditDialogService,
    useClass: AuditDialogService,
  }),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}

