import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  extractApiBase,
  provideEcContainerComponentOnInitialization,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';
import { NotificationsComponent } from './notifications/notifications/notifications-panel/notifications.component';

import { ILocalizationService, IVPortalUserMenuService } from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES } from '@eleon/notificator-proxy'
@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild([
      {
        path: 'notifications',
        loadChildren: () => import('./notifications/user-notifications.module').then(m => m.UserNotificationsModule),
      }
    ]),
  ],
  providers: [
    provideEcContainerComponentOnInitialization('layout-primeng-topbar-right', {
      component: NotificationsComponent, requiredAuthorize: true,
      orderIndex: 1,
    }),
    provideLocalizationOnInitialization(
          (cultureName: string) => extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=NotificatorModule`),
    provideOnInitialization({
      provide: APP_INITIALIZER,
      useFactory: (userMenuService: IVPortalUserMenuService, localizationService: ILocalizationService) => {
        return () => {
          userMenuService.addUserMenuItem({
            label: localizationService.instant(
              'NotificatorModule::Notifications'
            ),
            icon: 'pi pi-bell mr-2 w-2rem text-center',
            routerLink: '/notifications/dashboard',
            order: 2,
            visible: true,
            parentName: 'UserSideBar',
            expand: false,
          });
        }
      },
      deps: [IVPortalUserMenuService, ILocalizationService],
      multi: true,
    }),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  ]
})
export class AppModule {
}
