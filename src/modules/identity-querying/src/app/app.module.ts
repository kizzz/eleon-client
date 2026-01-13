import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { setRemoteDefinitions } from '@nx/angular/mf';
import {
  IIdentitySelectionDialogService,
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
import { PROXY_SERVICES as IDENTITY_QUERYING_PROXY_SERVICES, provideIdentityQuerying } from '@eleon/identity-querying.lib';
import { IdentitySelectionDialogService } from './identity-querying/services/identity-selection-dialog.service'
const remoteRoutes: Route[] = [];



export const providers = [
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure&localizationResources=TenantManagement`
  ),
  ...provideMultipleOnInitialization(IDENTITY_QUERYING_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  ...provideMultipleOnInitialization([
    ...provideIdentityQuerying(),
    { 
      provide: IIdentitySelectionDialogService, 
      useClass: IdentitySelectionDialogService
    }
  ])
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}

