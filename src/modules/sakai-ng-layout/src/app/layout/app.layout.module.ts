import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { CommonModule } from '@angular/common';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { EcContainerComponent } from '@eleon/primeng-layout.lib';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
    ],
    imports: [
        // BrowserModule,
        CommonModule,
        SharedModule,
        EcContainerComponent,
        FormsModule,
        HttpClientModule,
        // BrowserAnimationsModule,
        InputTextModule,
        DrawerModule,
        BadgeModule,
        RadioButtonModule,
        MenuModule,
        PopoverModule,
        ProfilePictureModule,
        ToggleSwitchModule,
        RippleModule,
        RouterModule,
        AppConfigModule
    ],
    exports: [AppLayoutComponent]
})
export class AppLayoutModule { }
