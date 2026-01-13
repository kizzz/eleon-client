import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createEcContainerComponentInitializer } from '@eleon/angular-sdk.lib';
import { LogoComponent } from './logo/logo.component';

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild([]),
  ],
  providers: [
    createEcContainerComponentInitializer('layout-primeng-logo', { component:  LogoComponent }),
  ]
})
export class AppModule {
}
