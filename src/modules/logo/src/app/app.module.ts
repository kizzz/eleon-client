import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideEcContainerComponentOnInitialization } from '@eleon/angular-sdk.lib';
import { LogoComponent } from './logo/logo.component';


export const providers = [
provideEcContainerComponentOnInitialization('layout-primeng-logo', { component:  LogoComponent }),
]

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild([]),
  ],
  providers
})
export class AppModule {
}
