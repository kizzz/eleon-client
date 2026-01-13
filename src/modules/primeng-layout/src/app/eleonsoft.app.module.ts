import { importProvidersFrom, NgModule } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { createAssetsInitializer, createEcContainerComponentInitializer } from '@eleon/angular-sdk.lib';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AppTitleStrategy } from './app-title-strategy';

import { LayoutService } from './layout/service/app.layout.service';
import { AppTopbarMenuComponent } from './layout/app.topbar-menu.component';

import { ILayoutService } from '@eleon/angular-sdk.lib';
export const remoteRoutes = [
	{
		path: '',
		loadChildren: () =>
			import('./layout/app.layout.module').then((r) => r.AppLayoutModule),
	},
]

export const providers = [
	createAssetsInitializer([
		`${window.location.protocol + '//' + window.location.host}/styles.css`,
		{ url: `${window.location.protocol + '//' + window.location.host}/assets/layout/styles/theme/lara-light-indigo/theme.css`, id: 'theme-css' },
    `${window.location.protocol + '//' + window.location.host}/assets/layout/styles/theme-overrides.css`,
		'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp|Material+Symbols+Outlined',
		'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
	]),
	createEcContainerComponentInitializer('layout-primeng-topbar-right-main', {
		component: AppTopbarMenuComponent,
	}),
	importProvidersFrom(BrowserAnimationsModule),
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
	},
]

@NgModule({
  declarations: [
  ],
  imports: [
		// UserManagementModule,
		// LogoModule,
  ],
  providers: providers,
})
export class AppModule {
}
