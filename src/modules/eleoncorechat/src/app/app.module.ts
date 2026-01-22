import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  extractApiBase,
  provideEcContainerComponentOnInitialization,
  provideMenuOnInitialization,
  provideOnInitialization,
  provideMultipleOnInitialization,
} from '@eleon/angular-sdk.lib';
import { CHAT_MODULE_CONFIG, DefaultParentMenuItems, IChatService, IVPortalMenuService } from '@eleon/angular-sdk.lib';
import { importProvidersFrom } from '@angular/core';
import { chatMenuItems } from './menu-items';
import { Route } from '@angular/router';
import { provideAssetsOnInitialization, provideLocalizationOnInitialization } from '@eleon/angular-sdk.lib';
import { ChatComponent } from './chat-popup/chat.component';
import { ChatFlayoutFacadeComponent } from './chat-flyout-facade/chat-flyout-facade.component';
import { DocumentViewerFacadeComponent } from './document-viewer-facade/document-viewer-facade.component';
import { ScreenCaptureViewerFacadeComponent } from './screen-capture-viewer-facade/screen-capture-viewer-facade.component';
import { NbThemeModule } from '@nebular/theme';
import { EleoncoreChatService } from '@vportal-ui/shared-chat'
import { PROXY_SERVICES } from '@eleon/collaboration-proxy'
import { PROXY_SERVICES as TENANT_MANAGEMENT_PROXY_SERVICES } from '@eleon/tenant-management-proxy';

export const remoteRoutes: Route[] = [
  {
    path: 'collaboration',
    loadChildren: () => import('./collaboration/collaboration.module').then(p => p.CollaborationModule),
  },
];

@NgModule({
  declarations: [
  ],
  imports: [
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [
    provideAssetsOnInitialization([
      `${window.location.protocol + '//' + window.location.host}/modules/eleoncorechat/styles.css`,
    ]),
    provideMenuOnInitialization(chatMenuItems),
    provideLocalizationOnInitialization(
      (cultureName: string) => extractApiBase('eleonsoft') + `/api/LanguageManagement/LocalizationOverride/GetLocalization?culture=${cultureName}&localizationResources=Collaboration`),
    provideOnInitialization(
      importProvidersFrom(NbThemeModule.forRoot()),
    ),
    provideEcContainerComponentOnInitialization('layout-primeng-topbar-right', {
      component: ChatComponent, requiredAuthorize: true,
      orderIndex: 2,
    }),
    provideEcContainerComponentOnInitialization('layout-primeng-main', { component: ChatFlayoutFacadeComponent, requiredAuthorize: true, }),
    provideEcContainerComponentOnInitialization('layout-primeng-main', { component: DocumentViewerFacadeComponent, requiredAuthorize: true, }),
    provideEcContainerComponentOnInitialization('layout-primeng-main', { component: ScreenCaptureViewerFacadeComponent, requiredAuthorize: true, }),
    ...provideMultipleOnInitialization(PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
    ...provideMultipleOnInitialization(TENANT_MANAGEMENT_PROXY_SERVICES.map(s => ({ provide: s, useClass: s }))),
		provideMenuOnInitialization([], dynamicMenuFactory, [IVPortalMenuService, CHAT_MODULE_CONFIG]),
    provideOnInitialization([
      {
        provide: IChatService,
        useClass: EleoncoreChatService,
      }
    ])
  ],
})
export class AppModule {
}


function dynamicMenuFactory(menuService: IVPortalMenuService, cfg: any) {
	return () => {
		if (!cfg){
			return;
		}

		console.log('Generating dynamic menu based on chat config:', cfg);

		const dynamicChatMenuItems = cfg?.routes?.map(r => (
				{
					routerLink: '/collaboration' + r.route,
					label: r.title,
					icon: r.icon || 'fas fa-comments',
					parentName: r.parentName || DefaultParentMenuItems.Administration,
					order: r.order,
					requiredAuthorize: true,
				}
			)) || [];

		menuService.addRange(dynamicChatMenuItems);
		menuService.refresh();

		console.log('Collaboration module dynamic menu items:', dynamicChatMenuItems);
	}
}
