import { Component, ElementRef, ViewChild } from '@angular/core';
import { Popover, PopoverModule } from 'primeng/popover';
import { Menu, MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { ButtonModule } from 'primeng/button';
import { IAuthManager, IApplicationConfigurationManager, IVPortalTopbarService, IAppearanceService } from '@eleon/angular-sdk.lib';
import { CommonUserService } from '@eleon/tenant-management-proxy';
import { ProfileService } from './service/profile.service';
import { EcContainerComponent } from '@eleon/primeng-layout.lib';
import { LocalizationModule } from '@eleon/angular-sdk.lib';

import { ILayoutService, IVPortalUserMenuService, VPortalUserMenuItem } from '@eleon/angular-sdk.lib';
@Component({
  selector: 'app-topbar-menu',
  template: `
    <div class="layout-topbar-menu">
      <!-- <button *ngIf="showPwaInstall" class="p-link layout-topbar-button"
        [pTooltip]="'Infrastructure::InstallPWA' | abpLocalization" tooltipPosition="bottom" (click)="installPwa()">
        <i class="fa fa-download"></i>
        <span>{{ 'Infrastructure::InstallPWA' | abpLocalization }}</span>
      </button> -->

      <!-- <app-web-push-enable-dialog></app-web-push-enable-dialog> -->

      <!-- <button class="p-link layout-topbar-button" routerLink="/calendar"
        [pTooltip]="'Infrastructure::Calendar' | abpLocalization" tooltipPosition="bottom">
        <i class="far fa-calendar-alt"></i>
        <span>{{ 'Infrastructure::Calendar' | abpLocalization }}</span>
      </button> -->

      <ec-container [key]="'layout-primeng-topbar-right'"></ec-container>

      <button class="p-link layout-topbar-button" (click)="changeTheme()" *ngIf="themeHasMode">
        <i class="fa-regular fa-lightbulb"></i>
        <span>Theme</span>
      </button>

      <p-popover #op styleClass="menu-overlay">
        <p-menu #menu [model]="profileItems" [style]="{ width: '16rem' }" (click)="resetProfileMenu(menu, $event, op)"></p-menu>
      </p-popover>

      <app-profile-picture class="layout-topbar-button mr-1"
        *ngIf="profileService.userProfile?.id"
        [userId]="profileService.userProfile.id"
        style="cursor:pointer"
        (click)="op.toggle($event)">
      </app-profile-picture>

      <div *ngIf="!auth.isAuthenticated()">
        <p-button [text]="true" [raised]="true"
          [label]="'Infrastructure::Login' | abpLocalization"
          (click)="login()"
          styleClass="p-button-sm">
        </p-button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ProfilePictureModule, ButtonModule, PopoverModule, EcContainerComponent, MenuModule, LocalizationModule]
})
export class AppTopbarMenuComponent {
  @ViewChild('op') overlayPanel!: Popover;
  @ViewChild('menu') menu!: Menu;

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

  profileItems: VPortalUserMenuItem[];
  
  constructor(
    public layoutService: ILayoutService,
    public auth: IAuthManager,
    public appearance: IAppearanceService,
        private config: IApplicationConfigurationManager,
    public el: ElementRef,
    protected userService: CommonUserService,
    public profileService: ProfileService,
    public topbarSettings: IVPortalTopbarService,
    private vPortalUserMenuService: IVPortalUserMenuService
  ) {
  }

  public ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.updateUserProfile();
    this.config.configUpdate$.subscribe(() => {
      this.updateUserProfile();
    });

    this.vPortalUserMenuService.refreshRequested.subscribe(_ => {
      this.profileItems = this.vPortalUserMenuService.userMenuItemTree;
    })
  }

  userId: string;
  updateUserProfile(){
    const userId = this.config.getAppConfig()?.currentUser?.id;
    if (userId && userId !== this.userId){
      this.userId = userId;
      this.getUserProfile(userId);
    }
  }

  getUserProfile(userId: string) {
    this.userService
      .getByIdById(userId)
      .subscribe((profile) => {
        this.profileService.userProfile = profile;
        this.setUserMenu();
      });
  }

  setUserMenu() {
    this.profileItems = this.vPortalUserMenuService.userMenuItemTree; // this.profileService.getProfileItemsForTopBar();
  }


  changeTheme() {
    const oldMode = this.isThemeDark ? "dark" : "light";
    const newMode = oldMode === "dark" ? "light" : "dark";
    this.layoutService.config.update((config) => ({
      ...config,
      theme: this.theme.replace(oldMode, newMode),
      colorScheme: newMode,
      menuTheme: newMode,
      isSave: true,
    }));
  }



  resetProfileMenu(menu: Menu, e: any, dialog: any) {
    menu.onListBlur(e);
    dialog.toggle(e);
  }

  login() {
    this.auth.navigateToLogin();
  }
}
