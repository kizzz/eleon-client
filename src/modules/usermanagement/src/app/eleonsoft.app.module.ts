import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  createEcContainerComponentInitializer,
  createLocalizationInitializerUnified,
  extractApiBase,
} from '@eleon/angular-sdk.lib';
import { LocalizationSchema } from '@eleon/angular-sdk.lib';
import { QuickReloginComponent } from './quick-relogin/quick-relogin.component';


export const remoteRoutes = [
  {
    path: 'user-account',
    loadChildren: () => import('./user-account/user-account.module').then(p => p.UserAccountModule),
  },
];


@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [
    createEcContainerComponentInitializer('layout-primeng-topbar-right', { component: QuickReloginComponent, requiredAuthorize: true, orderIndex: 3, }),
    createLocalizationInitializerUnified(
			LocalizationSchema.Ec,
      (cultureName: string) =>
        `${extractApiBase('eleonsoft')}/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=VPortal&localizationResources=TenantManagement`),
  ],
})
export class AppModule {
}
