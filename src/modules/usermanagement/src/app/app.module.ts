import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { extractApiBase, provideEcContainerComponentOnInitialization, provideLocalizationOnInitialization, provideMultipleOnInitialization, provideOnInitialization } from '@eleon/angular-sdk.lib';
import { QuickReloginComponent } from './quick-relogin/quick-relogin.component';
import { ILocalizationService, IVPortalUserMenuService } from '@eleon/angular-sdk.lib';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';

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
    provideEcContainerComponentOnInitialization('layout-primeng-topbar-right', { component: QuickReloginComponent, requiredAuthorize: true, orderIndex: 3, }),
    provideLocalizationOnInitialization(
      (cultureName: string) =>
        extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=VPortal&localizationResources=TenantManagement`),
    provideOnInitialization({
      provide: APP_INITIALIZER,
      useFactory: (userMenuService: IVPortalUserMenuService, localizationService: ILocalizationService) => {
        return () => {
          userMenuService.addUserMenuItemRange([
            {
              label: localizationService.instant('Infrastructure::MyAccount'),
              icon: 'pi pi-user mr-2 w-2rem text-center',
              routerLink: '/user-account/profile',
              order: 0,
              visible: true,
              parentName: 'UserSideBar',
              expand: false,
            },
            {
              label: localizationService.instant('TenantManagement::Sessions'),
              icon: 'pi pi-desktop mr-2 w-2rem text-center',
              routerLink: '/user-account/sessions',
              visible: true,
              order: 4,
              parentName: 'UserSideBar',
              expand: false,
            },
          ]);
        }
      },
      deps: [IVPortalUserMenuService, ILocalizationService],
    }),
    ...provideMultipleOnInitialization(provideIdentityQuerying()),
  ],
})
export class AppModule {
}
