import { Component, NgModuleRef, OnDestroy, OnInit, Renderer2, ViewChild, ViewContainerRef, effect } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Route, Router, Routes } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { IAppearanceService, IAuthManager } from '@eleon/angular-sdk.lib';
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppTopBarComponent } from './app.topbar.component';
import { MenuService } from './app.menu.service';
import { CanDeactivateSaveGuard, DetectCanDeactivateGuardService } from '@eleon/primeng-ui.lib';
 
import { ILayoutService } from '@eleon/angular-sdk.lib';
@Component({
    standalone: false,
    selector: 'app-layout',
    styles: `
      
`,
    templateUrl: './app.layout.component.html'
})
export class AppLayoutComponent implements OnDestroy, OnInit {

    overlayMenuOpenSubscription: Subscription;
    topbarMenuOpenSubscription: Subscription;

    menuOutsideClickListener: any;

    profileMenuOutsideClickListener: any;

    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;

    @ViewChild(AppTopBarComponent) appTopbar!: AppTopBarComponent;

    menuProfileOpenSubscription: Subscription;

    menuProfileOutsideClickListener: any;
    topbarMenuOutsideClickListener: any;
    menuScrollListener: any;
    public authorized$ = this.auth.authorized$;
    private detectCanDeactivateGuardSubscription: Subscription;

    constructor(
        public layoutService: ILayoutService,
        public renderer: Renderer2,
        public router: Router,
        private menuService: MenuService,
        private moduleRef: NgModuleRef<any>,
        private route: ActivatedRoute,
        private auth: IAuthManager,
        private appearanceService: IAppearanceService,
        private detectCanDeactivateGuardService: DetectCanDeactivateGuardService,
        ) {

        appearanceService.init();
        
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            this.hideTopbarMenu();

            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen(
                    'document',
                    'click',
                    (event) => {
                        const isOutsideClicked = !(
                            this.appSidebar.el.nativeElement.isSameNode(
                                event.target
                            ) ||
                            this.appSidebar.el.nativeElement.contains(
                                event.target
                            ) ||
                            this.appTopbar.menuButton1.nativeElement.isSameNode(
                                event.target
                            ) ||
                            this.appTopbar.menuButton1.nativeElement.contains(
                                event.target
                            ) ||
                            this.appTopbar.menuButton2.nativeElement.isSameNode(
                                event.target
                            ) ||
                            this.appTopbar.menuButton2.nativeElement.contains(
                                event.target
                            )
                        );
                        if (isOutsideClicked) {
                            this.hideMenu();
                        }
                    }
                );
            }

            if (
                (this.layoutService.isHorizontal() ||
                    this.layoutService.isSlim() ||
                    this.layoutService.isSlimPlus()) &&
                !this.menuScrollListener
            ) {
                this.menuScrollListener = this.renderer.listen(
                    this.appSidebar.menuContainer.nativeElement,
                    'scroll',
                    (event) => {
                        if (this.layoutService.isDesktop()) {
                            this.hideMenu();
                        }
                    }
                );
            }

            if (this.layoutService.config().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });
        this.topbarMenuOpenSubscription =
            this.layoutService.topbarMenuOpen$.subscribe(() => {
                if (!this.topbarMenuOutsideClickListener) {
                    this.topbarMenuOutsideClickListener = this.renderer.listen(
                        'document',
                        'click',
                        (event) => {
                            const isOutsideClicked = !(
                                this.appTopbar.el.nativeElement.isSameNode(
                                    event.target
                                ) ||
                                this.appTopbar.el.nativeElement.contains(
                                    event.target
                                ) ||
                                this.appTopbar.mobileMenuButton.nativeElement.isSameNode(
                                    event.target
                                ) ||
                                this.appTopbar.mobileMenuButton.nativeElement.contains(
                                    event.target
                                )
                            );
                            if (isOutsideClicked) {
                                this.hideTopbarMenu();
                            }
                        }
                    );
                }

                if (this.layoutService.config().staticMenuMobileActive) {
                    this.blockBodyScroll();
                }
            });
        this.menuProfileOpenSubscription =
        this.layoutService.menuProfileOpen$.subscribe(() => {
            this.hideMenu();

            if (!this.menuProfileOutsideClickListener) {
                this.menuProfileOutsideClickListener = this.renderer.listen(
                    'document',
                    'click',
                    (event) => {
                        const isOutsideClicked = !(
                            this.appSidebar.menuProfile.el.nativeElement.isSameNode(
                                event.target
                            ) ||
                            this.appSidebar.menuProfile.el.nativeElement.contains(
                                event.target
                            )
                        );
                        if (isOutsideClicked) {
                            this.hideMenuProfile();
                        }
                    }
                );
            }
        });
        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu();
                this.hideProfileMenu();
                this.hideMenuProfile();
            });
    }

    ngOnInit(): void {
        this.detectCanDeactivateGuardSubscription = this.detectCanDeactivateGuardService.onRequestCheck().subscribe(() => {
          const result = this.checkCanDeactivate();
          this.detectCanDeactivateGuardService.updateResult(result);
        });
      }

    hideMenu() {
        this.layoutService.config.update((config) => ({
          ...config,
          overlayMenuActive: false,
          staticMenuMobileActive: false,
          menuHoverActive: false,
        }));
        this.menuService.reset();

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }

        if (this.menuScrollListener) {
            this.menuScrollListener();
            this.menuScrollListener = null;
        }
        this.unblockBodyScroll();
    }

    hideMenuProfile() {
        this.layoutService.config.update((config) => ({
          ...config,
          menuProfileActive: false,
        }));

        if (this.menuProfileOutsideClickListener) {
            this.menuProfileOutsideClickListener();
            this.menuProfileOutsideClickListener = null;
        }
    }
    hideTopbarMenu() {
        this.layoutService.config.update((config) => ({
          ...config,
          topbarMenuActive: false,
        }));

        if (this.topbarMenuOutsideClickListener) {
            this.topbarMenuOutsideClickListener();
            this.topbarMenuOutsideClickListener = null;
        }
    }
    hideProfileMenu() {
        this.layoutService.config.update((config) => ({
          ...config,
          profileSidebarVisible: false,
        }));
        if (this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener();
            this.profileMenuOutsideClickListener = null;
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
        else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    
    get isThemeDark() {
        return this.theme.includes('dark');
    }

    get isThemeLight() {
        return this.theme.includes('light');
    }
    get theme(): string {
        return this.layoutService.config().theme;
    }

    get containerClass() {

        let styleClass: { [key: string]: any } = {
            'layout-overlay':
                this.layoutService.config().menuMode === 'overlay',
            'layout-static': this.layoutService.config().menuMode === 'static',
            'layout-slim': this.layoutService.config().menuMode === 'slim',
            'layout-slim-plus':
                this.layoutService.config().menuMode === 'slim-plus',
            'layout-horizontal':
                this.layoutService.config().menuMode === 'horizontal',
            'layout-reveal': this.layoutService.config().menuMode === 'reveal',
            'layout-drawer': this.layoutService.config().menuMode === 'drawer',
            'p-input-filled':
                this.layoutService.config().inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config().ripple,
            'layout-static-inactive': this.layoutService.config().hideSidebar ||
                this.layoutService.config().staticMenuDesktopInactive &&
                this.layoutService.config().menuMode === 'static',
            'layout-overlay-active': this.layoutService.config().overlayMenuActive,
            'layout-mobile-active':
            this.layoutService.config().staticMenuMobileActive,
            'layout-topbar-menu-active':
            this.layoutService.config().topbarMenuActive,
            'layout-menu-profile-active':
            this.layoutService.config().menuProfileActive,
            'layout-sidebar-active': !this.layoutService.config().hideSidebar && this.layoutService.config().sidebarActive,
            'layout-sidebar-anchored': this.layoutService.config().anchored,
            'full-width': this.layoutService.config().isFullWidth,
        };


        styleClass['layout-topbar-' + this.layoutService.config().topbarTheme] =
            true;
        styleClass['layout-menu-' + this.layoutService.config().menuTheme] =
            true;

        styleClass['layout-' + (this.isThemeDark ? 'dark' : 'light')] = true;

        styleClass['layout-' + this.layoutService.config().componentTheme] = true;
        // styleClass[
            // 'layout-menu-profile-' +
                // this.layoutService.config().menuProfilePosition
        // ] = true;
        return styleClass;
    }

    checkCanDeactivate(): boolean {
        let currentRoute: ActivatedRouteSnapshot | null = this.route.snapshot;
    
        while (currentRoute?.firstChild) {
          currentRoute = currentRoute?.firstChild;
        }
    
        return currentRoute?.routeConfig?.canDeactivate?.some(guard => guard === CanDeactivateSaveGuard) ?? false;
      }
    
    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }

        if (this.detectCanDeactivateGuardSubscription) {
            this.detectCanDeactivateGuardSubscription.unsubscribe();
        }
    }
}
