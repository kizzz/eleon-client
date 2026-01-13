import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  NgModuleRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { MenuItem } from "primeng/api";
import { IAppearanceService, IEcContainerService, IImpersonationService, IVPortalTopbarService } from '@eleon/angular-sdk.lib';
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { CommonUserService } from '@eleon/tenant-management-proxy';
import { ProfileService } from "./service/profile.service";
import { isPWAInstallPromptAvailable, promptPWAInstall } from '@eleon/angular-sdk.lib';
import { Menu } from "primeng/menu";
import { AppTopbarMenuComponent } from "./app.topbar-menu.component";

import { ILayoutService, VPortalUserMenuItem } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-topbar",
  styles: `
    .breadcrumb {
      list-style: none;
      display:flex;
    }
    .menu-item a {
      color: var(--primary-color);
    }
  `,
  templateUrl: "./app.topbar.component.html",
  styleUrl: "./app.toolbar.component.scss",
})
export class AppTopBarComponent {
  public showPwaInstall = isPWAInstallPromptAvailable();
  items!: MenuItem[];

  @ViewChild("mobileMenuButton") mobileMenuButton!: ElementRef;

  profileItems: VPortalUserMenuItem[];

  @ViewChild("menubutton1") menuButton1!: ElementRef;
  @ViewChild("menubutton2") menuButton2!: ElementRef;

  @ViewChild("topbarmenubutton") topbarMenuButton!: ElementRef;

  @ViewChild("topbarmenu") menu!: ElementRef;

  get theme(): string {
    return this.layoutService.config().theme;
  }

  get themeHasMode() {
    return this.isThemeDark || this.isThemeLight;
  }

  get isThemeDark() {
    return this.theme.includes("dark");
  }

  get isThemeLight() {
    return this.theme.includes("light");
  }
  get isTopbarThemeDark() {
    return this.layoutService.topbarThemes.find(t => t.name == this.layoutService.config().topbarTheme)?.isDark;
  }

  get isTopbarThemeLight() {
    return !this.layoutService.topbarThemes.find(t => t.name == this.layoutService.config().topbarTheme)?.isDark;
  }



  returnToImpersonator(): void {
    this.impersonationSerivce.returnToImpersonator();
  }

  logout() {
    
    this.auth.logout();
  }

  get isHidden() {
    return this.layoutService.config().hideTopbar;
  }


  
  constructor(
    public layoutService: ILayoutService,
    private impersonationSerivce: IImpersonationService,
    private auth: IAuthManager,
    public appearance: IAppearanceService,
    private config: IApplicationConfigurationManager,
    public el: ElementRef,
    protected userService: CommonUserService,
    public profileService: ProfileService,
    public topbarSettings: IVPortalTopbarService,
    public ecContainerService: IEcContainerService
  ) {
  }

  isHideBreadCrumbs(): boolean {
    return window.innerWidth <= 800;
  }

}
