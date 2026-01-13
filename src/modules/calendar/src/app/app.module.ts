import { NgModule } from '@angular/core';
import { extractApiBase } from '@eleon/angular-sdk.lib';
import {
  DefaultParentMenuItems,
  VPortalMenuItem,
} from '@eleon/angular-sdk.lib';
import { Route, RouterModule } from '@angular/router';
import {
  provideLocalizationOnInitialization,
  provideMenuOnInitialization,
} from '@eleon/angular-sdk.lib';

export const remoteRoutes: Route[] = [
  {
    path: 'calendar',
    loadChildren: () =>
      import('./calendar/custom-calendar.module').then(
        (r) => r.CustomCalendarModule
      ),
  },
];

export const providers = [
  provideMenuOnInitialization([]),
  provideLocalizationOnInitialization(
    (cultureName: string) =>
      extractApiBase('eleonsoft') +
      `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Infrastructure`
  ),
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(remoteRoutes)],
  providers,
})
export class AppModule {}