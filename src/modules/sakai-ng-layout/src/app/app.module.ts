import { APP_INITIALIZER, importProvidersFrom, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IAppearanceService, IApplicationConfigurationManager, IBreadcrumbsService, provideAssetsOnInitialization, provideMultipleOnInitialization } from '@eleon/angular-sdk.lib';
import { LayoutService } from './layout/service/app.layout.service';
import { ILayoutService } from '@eleon/angular-sdk.lib';
import { AppearanceService, BreadcrumbsService } from '@eleon/primeng-layout.lib';
import { TenantAppearanceService } from '@eleon/system-services.lib';
import { provideIdentityQuerying } from '@eleon/identity-querying.lib';
import { provideVPortalMenu } from '@eleon/primeng-layout.lib';

@NgModule({
    declarations: [
        AppComponent, 
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
    ],
    providers: [
        ...provideMultipleOnInitialization([
            provideAssetsOnInitialization([
                `${window.location.protocol + '//' + window.location.host}/modules/sakai-ng-layout/styles.css`,
                { url: `${window.location.protocol + '//' + window.location.host}/modules/sakai-ng-layout/assets/layout/styles/theme/lara-light-indigo/theme.css`, id: 'theme-css' },
            ]),
            importProvidersFrom(BrowserAnimationsModule),
            ConfirmationService,
            DialogService,
            MessageService,
            {
                provide: ILayoutService,
                useClass: LayoutService
            },
        ]),
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
          ...provideVPortalMenu()
        ]),
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}
