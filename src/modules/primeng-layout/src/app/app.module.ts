import { APP_INITIALIZER, importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter, RouterModule, Routes, TitleStrategy } from '@angular/router';
import { setRemoteDefinitions } from '@nx/angular/mf';
import {
  IAppearanceService,
  IApplicationConfigurationManager,
  IBreadcrumbsService,
  provideAssetsOnInitialization,
  provideEcContainerComponentOnInitialization,
  provideMultipleOnInitialization,
} from '@eleon/angular-sdk.lib';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { DialogService } from 'primeng/dynamicdialog';
import { AppTitleStrategy } from './app-title-strategy';
import { LayoutService } from './layout/service/app.layout.service';
import { AppTopbarMenuComponent } from './layout/app.topbar-menu.component';
import { ILayoutService } from '@eleon/angular-sdk.lib';
import { AppearanceService, BreadcrumbsService } from '@eleon/primeng-layout.lib';
import { TenantAppearanceService } from '@eleon/system-services.lib';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';

export const remoteRoutes = [
	{
		path: '',
		loadChildren: () =>
			import('./layout/app.layout.module').then((r) => r.AppLayoutModule),
	},
]

export const providers = [
	provideAssetsOnInitialization([
		`${window.location.protocol + '//' + window.location.host}/modules/layout/styles.css`,
    { url: `${window.location.protocol + '//' + window.location.host}/modules/layout/assets/layout/styles/theme/lara-light-indigo/theme.css`, id: 'theme-css' },
		'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp|Material+Symbols+Outlined',
		'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
	]),
	provideEcContainerComponentOnInitialization('layout-primeng-topbar-right-main', {
		component: AppTopbarMenuComponent,
	}),
	...provideMultipleOnInitialization([
		importProvidersFrom(BrowserAnimationsModule),
		providePrimeNG({
			theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.eleon-dark-mode',
        }
			},
		}),
		ConfirmationService,
		DialogService,
		MessageService,
		{
			provide: TitleStrategy,
			useClass: AppTitleStrategy,
		},
		{
			provide: ILayoutService,
			useClass: LayoutService,
		}
	],),
  ...provideMultipleOnInitialization(provideIdentityQuerying()),
  ...provideMultipleOnInitialization(
    [
      {
        provide: IBreadcrumbsService,
        useFactory: () => {
          return new BreadcrumbsService();
        }
      },
      {
        provide: IAppearanceService,
        useFactory: (config: IApplicationConfigurationManager, tenantAppearanceService: TenantAppearanceService) => {
          return new AppearanceService(config, tenantAppearanceService);
        },
        deps: [IApplicationConfigurationManager, TenantAppearanceService]
      },
    ]
  )
]

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes),
  ],
  providers: providers,
})
export class AppModule {
}
