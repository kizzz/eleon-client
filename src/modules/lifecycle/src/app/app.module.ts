import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {
  provideAssetsOnInitialization,
  provideInitializationComponent,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
  loadEleoncoreRemoteModule,
  PermissionGuard,
  EcAuthGuard,
  DefaultParentMenuItems,
} from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES } from '@eleon/lifecycle-feature-proxy';
import { ILifecycleService } from '@eleon/angular-sdk.lib';
import { LifecycleService } from './services/lifecycle.service';

export const providers = [
  provideMenuOnInitialization([
    {
      label: 'Lifecycle::Menu:Lifecycle',
      routerLink: null,
      parentName: DefaultParentMenuItems.Administration,
      icon: 'fas fa-list-check',
      order: 3,
      requiredPolicy: '',
    },
    {
      label: 'Lifecycle::Menu:Lifecycle:Workflows',
      routerLink: '/lifecycle/workflows',
      parentName: 'Lifecycle::Menu:Lifecycle',
      icon: 'fas fa-list-check',
      order: 1,
      requiredPolicy: '',
    },
    {
      label: 'Lifecycle::Menu:Lifecycle:Reports',
      routerLink: '/lifecycle/reports',
      parentName: 'Lifecycle::Menu:Lifecycle',
      icon: 'fas fa-rectangle-list',
      order: 2,
      requiredPolicy: '',
    },
  ]),
  ...provideMultipleOnInitialization(
    PROXY_SERVICES.map((s) => ({ provide: s, useClass: s }))
  ),
  provideOnInitialization({
    provide: ILifecycleService,
    useClass: LifecycleService,
  }),
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'lifecycle',
        loadChildren: () =>
          import('./lifecycle/lifecycle.module').then((m) => m.LifecylceModule),
        canActivate: [EcAuthGuard, PermissionGuard],
        data: {},
      },
    ]),
  ],
  providers,
})
export class AppModule {}
