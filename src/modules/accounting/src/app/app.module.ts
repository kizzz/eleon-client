import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { setRemoteDefinitions } from '@nx/angular/mf';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  Component,
  importProvidersFrom,
} from '@angular/core';
import { extractApiBase } from '@eleon/angular-sdk.lib';
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';
import {
  DefaultParentMenuItems,
  VPortalMenuItem,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import {
  provideAssetsOnInitialization,
  provideInitializationComponent,
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
  provideMultipleOnInitialization,
  provideOnInitialization,
} from '@eleon/angular-sdk.lib';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';

export const remoteRoutes: Route[] = [
  {
    path: "account",
    loadChildren: () =>
      import("./accounting/accounting.module").then((m) => m.AccountingModule),
    canActivate: [EcAuthGuard, PermissionGuard],
    data: {
      requiredPolicy: "Permission.Account.General",
    },
  }
];

const allRoutes = [
  {
    routerLink: null,
    label: DefaultParentMenuItems.Accounting,
    icon: 'pi pi-cog',
    order: 5,
    //requiredPolicy: "VPortal.Dashboard.Host || VPortal.Dashboard.Tenant || SuspendedAdmin",
  },
  {
    routerLink: '/account/dashboard',
    label: 'AccountingModule::Menu:Accounts:Dashboard',
    parentName: DefaultParentMenuItems.Accounting,
    icon: 'fas fa-list',
    order: 1,
    //requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
  {
    routerLink: '/account/packagetemplate/dashboard',
    label: 'AccountingModule::Menu:PackageTemplates',
    parentName: DefaultParentMenuItems.Accounting,
    icon: 'fas fa-list',
    order: 2,
    // requiredPolicy: "Permission.Account.General && VPortal.Dashboard.Host",
  },
];

export const providers = [
  provideMenuOnInitialization(allRoutes),
  provideLocalizationOnInitialization(
    (cultureName: string) => extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=AccountingModule`
  ),
  ...provideMultipleOnInitialization(provideIdentityQuerying()),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}


