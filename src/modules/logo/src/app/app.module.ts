import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideEcContainerComponentOnInitialization } from '@eleon/angular-sdk.lib';
import { LogoComponent } from './logo/logo.component';

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild([]),
  ],
  providers: [
    provideEcContainerComponentOnInitialization('layout-primeng-logo', { component:  LogoComponent }),
  ],
})
export class AppModule {
}
