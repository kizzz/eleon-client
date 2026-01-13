import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RippleModule } from 'primeng/ripple';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigModule } from './config/config.module';
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppLayoutComponent } from "./app.layout.component";
import { SelectModule } from 'primeng/select';
import { OverlayModule } from 'primeng/overlay';
import { PopoverModule } from 'primeng/popover';
import {ButtonModule} from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { ListboxModule } from 'primeng/listbox';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AppMenuProfileComponent } from './app.menuprofile.component';
import { CommonModule } from '@angular/common';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { PipesModule } from '@eleon/angular-sdk.lib';
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarModule } from 'primeng/menubar';
import { AppTopBarCustomComponent } from './app.topbar-custom.component';
import { EcContainerComponent, EcRouterOutletComponent } from '@eleon/primeng-layout.lib';


@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppMenuProfileComponent,
        AppLayoutComponent,
        AppTopBarCustomComponent,
    ],
    imports: [
        CommonModule,
        EcContainerComponent,
        EcRouterOutletComponent,
        RouterModule.forChild([
            {
                path: '',
                component: AppLayoutComponent,
                children: [
                    // {
                    //     path: '**',
                    //     component: LoadingComponent,
                    // },
                ],
                data: {
                    routeForLoadingSubmodules: true,
                }
            }
        ]),
        FormsModule,
        ConfirmDialogModule,
        ToastModule,
        BreadcrumbComponent,
        InputTextModule,
        ButtonModule,
        DrawerModule,
        BadgeModule,
        BreadcrumbModule,
        RadioButtonModule,
        ToggleSwitchModule,
        RippleModule,
        OverlayModule,
        TagModule,
        MenuModule,
        PopoverModule,
        BadgeModule,
        PipesModule,
        SelectModule,
        ProfilePictureModule,
        ListboxModule,
        RouterModule,
        AppConfigModule,
        TooltipModule,
        MenubarModule
    ],
    exports: [
        // AppLayoutComponent
    ],
    providers: [
        // VPORTAL SERVICES
    ]
})
export class AppLayoutModule { }
