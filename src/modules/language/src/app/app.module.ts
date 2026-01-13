import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { provideEcContainerComponentOnInitialization, provideMultipleOnInitialization } from '@eleon/angular-sdk.lib';
import { LanguageComponent } from './language/language.component';

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild([]),
  ],
  providers: [
    provideEcContainerComponentOnInitialization('layout-primeng-topbar-right', {
      component: LanguageComponent,
      orderIndex: 4,
    }),
  ],
})
export class AppModule {
}


