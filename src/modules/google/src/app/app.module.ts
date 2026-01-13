import { NgModule } from '@angular/core';
import {   
  IGoogleService,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import {
  provideAssetsOnInitialization,
  provideInitializationComponent,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
  loadEleoncoreRemoteModule,
} from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES } from '@eleon/google-proxy';
import { GoogleService } from './services/google.service'



export const providers = [
  ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  provideOnInitialization({
    provide: IGoogleService,
    useClass: GoogleService,
  })
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild([])],
  providers,
})
export class AppModule {}