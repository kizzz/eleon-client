import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

import { AppMenuProfileComponent } from './app.menuprofile.component';

import { IAppearanceService, ILayoutService } from '@eleon/angular-sdk.lib';
@Component({
    standalone: false,
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html'
})
export class AppSidebarComponent implements OnDestroy  {
    timeout: any = null;
    // @ViewChild(AppMenuProfileComponent) menuProfile!: AppMenuProfileComponent;

    @ViewChild('menuContainer') menuContainer!: ElementRef;


    @ViewChild(AppMenuProfileComponent) menuProfile!: AppMenuProfileComponent;

    get isThemeDark() {
        return this.theme.includes('dark');
    }

    get isThemeLight() {
        return this.theme.includes('light');
    }
    get theme(): string {
        return this.layoutService.config().theme;
    }

    get isHidden() {
        return this.layoutService.config().hideSidebar;
    }


    get menuProfilePosition(): string {
        return this.layoutService.config().menuProfilePosition;
    }
    get menuMode(): string {
        return this.layoutService.config().menuMode;
    }
    constructor(public layoutService: ILayoutService, public el: ElementRef,
        public appearance: IAppearanceService) {
        }

    resetOverlay() {
        if (this.layoutService.config().overlayMenuActive) {
            this.layoutService.config.update((config) => ({
              ...config,
              overlayMenuActive: false,
            }));
        }
    }

    // get menuProfilePosition(): string {
    //     return this.layoutService.config().menuProfilePosition;
    // }

    onMouseEnter() {
        if (!this.layoutService.config().anchored) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            this.layoutService.config().sidebarActive = true;
        }
    }

    onMouseLeave() {
        if (!this.layoutService.config().anchored) {
            if (!this.timeout) {
                this.timeout = setTimeout(
                    () => (
                        this.layoutService.config.update((config) => ({
                          ...config,
                          sidebarActive: false,
                        }))
                    ),
                    300
                );
            }
        }
    }

    anchor() {
        this.layoutService.config.update((config) => ({
          ...config,
          anchored: !this.layoutService.config().anchored,
        }));
    }

    ngOnDestroy() {
        this.resetOverlay();
    }

    get isHorizontal() {
        return this.layoutService.isHorizontal();
    }

    get isStatic() {
        return this.layoutService.config().menuMode === 'static'
    }
}

