import { Injectable } from '@angular/core';
import {
  CommonUserDto,
} from '@eleon/tenant-management-proxy';
import {
  isPWAInstallPromptAvailable,
  promptPWAInstall,
} from '@eleon/angular-sdk.lib';

import {
  ILayoutService,
  ILocalizationService,
  IPermissionService,
  IVPortalUserMenuService,
  VPortalUserMenuItem,
  IApplicationConfigurationManager,
  IAuthManager,
  IImpersonationService,
} from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  userProfile = {} as CommonUserDto;
  canReturnToImpersonator: boolean =
    this.impersonationService.canReturnToImpersonator();
  canNavigateToApplications = false;

  constructor(
    public layoutService: ILayoutService,
    public localizationService: ILocalizationService,
    public impersonationService: IImpersonationService,
    private auth: IAuthManager,
    private vPortalUserMenuService: IVPortalUserMenuService,
    private permissionService: IPermissionService,
    private config: IApplicationConfigurationManager
  ) {
    this.canNavigateToApplications = this.permissionService.getGrantedPolicy(
      'Permission.Administration'
    );
    config.configUpdate$.subscribe((res) => {
      this.canNavigateToApplications = this.permissionService.getGrantedPolicy(
        'Permission.Administration'
      );
    });
  }

  public showPwaInstall = isPWAInstallPromptAvailable();

  fillUserProfileRoutes() {
    this.vPortalUserMenuService.addUserMenuItemRange([
      ...this.getProfileItems(),
    ]);
    this.vPortalUserMenuService.refresh();
  }

  getProfileItemsForTopBar(): VPortalUserMenuItem[] {
    return [
      {
        label:
          this.userProfile?.name +
          (this.userProfile?.surname?.length > 0
            ? ' ' + this.userProfile?.surname
            : ''),
        items: this.getProfileItems(),
        order: 0,
        visible: true,
        expand: false,
      },
    ];
  }

  getProfileItems(): VPortalUserMenuItem[] {
    return [
      {
        label: this.localizationService.instant(
          'TenantManagement::ReturnToImpersonator'
        ),
        icon: 'pi pi-sign-out mr-2 w-2rem text-center',
        command: () => this.impersonationService.returnToImpersonator(),
        visible: this.canReturnToImpersonator,
        order: 6,
        parentName: 'UserSideBar',
        expand: false,
      },
      {
        label: this.localizationService.instant(
          'TenantManagement::Administration'
        ),
        icon: 'fa-solid fa-globe mr-2 w-2rem text-center',
        command: () => (window.location.href = '/apps/admin'),
        visible: this.canNavigateToApplications,
        order: 8,
        parentName: 'UserSideBar',
        expand: false,
        requiredPolicy: 'Permission.Administration',
      },
      {
        label: this.localizationService.instant(
          'TenantManagement::InstallAsApp'
        ),
        icon: 'pi pi-arrow-down mr-2 w-2rem text-center',
        command: () => this.installPwa(),
        visible: this.showPwaInstall,
        order: 9,
        parentName: 'UserSideBar',
        expand: false,
      },
      {
        label: this.localizationService.instant(
          'TenantManagement::Appearance'
        ),
        icon: 'fa-solid fa-gear mr-2 w-2rem text-center',
        command: () => this.layoutService.showConfigSidebar(),
        visible: true,
        order: 10,
        parentName: 'UserSideBar',
        expand: false,
      },
      {
        label: this.localizationService.instant('TenantManagement::SignOut'),
        icon: 'pi pi-sign-out mr-2 w-2rem text-center',
        command: () => this.logout(),
        visible: !this.canReturnToImpersonator,
        order: 11,
        parentName: 'UserSideBar',
        expand: false,
      },
    ];
  }

  logout() {
    this.auth.logout();
  }

  async installPwa() {
    await promptPWAInstall();
    this.showPwaInstall = isPWAInstallPromptAvailable();
  }
}
