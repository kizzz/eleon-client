import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { ProfileService } from './service/profile.service';
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { IUserService } from '@eleon/angular-sdk.lib';
import { Menu } from 'primeng/menu';


import { ILayoutService, VPortalUserMenuItem } from '@eleon/angular-sdk.lib';
@Component({
    standalone: false,
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];
    profileItems: VPortalUserMenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService,
        private config: IApplicationConfigurationManager,
        private userService: IUserService,
        private auth: IAuthManager,
        public profileService: ProfileService,) { }
    public ngOnInit(): void {
        if (!this.auth.isAuthenticated()) {
            return;
        }
        this.getUserProfile();
    }

    getUserProfile() {
        this.userService
            .getById(this.config.getAppConfig().currentUser?.id)
            .subscribe((profile) => {
                this.profileService.userProfile = profile;
                this.setUserMenu();
            });
    }

    setUserMenu() {
        this.profileItems = this.profileService.getProfileItemsForTopBar();
    }
    resetProfileMenu(menu: Menu, e: any, dialog: any) {
        menu.onListBlur(e);
        dialog.toggle(e);
    }
}
