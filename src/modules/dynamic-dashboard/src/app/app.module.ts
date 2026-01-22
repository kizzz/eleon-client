import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from '@angular/router';
import { provideMenuOnInitialization, provideMultipleOnInitialization } from '@eleon/angular-sdk.lib';
import { DefaultParentMenuItems, VPortalMenuItem } from '@eleon/angular-sdk.lib';
import { PROXY_SERVICES } from '@eleon/dynamic-dashboard-proxy'

export const remoteRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(p => p.HomeModule),
  },
];


const commonMenuItems: VPortalMenuItem[] = [
  {
    routerLink: "/home",
    label: DefaultParentMenuItems.Application,
    icon: "fa fa-house",
    parentName: null,
    order: 0,
  },
  {
    routerLink: "/home",
    label: "Infrastructure::Home",
    icon: "fa fa-house",
    parentName: DefaultParentMenuItems.Application,
    order: 0,
  },
];

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [
    provideMenuOnInitialization(commonMenuItems),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
  ],
})
export class AppModule {
}
