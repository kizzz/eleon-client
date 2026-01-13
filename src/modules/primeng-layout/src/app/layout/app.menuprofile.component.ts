import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, Renderer2, ViewChildren } from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { CommonUserService } from '@eleon/tenant-management-proxy';
import { ProfileService } from "./service/profile.service";
import { Router } from "@angular/router";

import { ILayoutService, ILocalizationService, IVPortalUserMenuService, VPortalUserMenuItem } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-menu-profile",
  templateUrl: "./app.menuprofile.component.html",
  animations: [
    trigger("menu", [
      transition("void => inline", [
        style({ height: 0 }),
        animate(
          "400ms cubic-bezier(0.86, 0, 0.07, 1)",
          style({ opacity: 1, height: "*" })
        ),
      ]),
      transition("inline => void", [
        animate(
          "400ms cubic-bezier(0.86, 0, 0.07, 1)",
          style({ opacity: 0, height: "0" })
        ),
      ]),
      transition("void => overlay", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition("overlay => void", [
        animate(".1s linear", style({ opacity: 0 })),
      ]),
    ]),
  ],
  styles: [
    `
      .child-menu >ul > li> button{
        padding: .75rem 2rem !important;
      }
    `
  ]
})
export class AppMenuProfileComponent implements AfterViewInit, OnDestroy {
  profileItems: VPortalUserMenuItem[];

  constructor(
    public layoutService: ILayoutService,
    public el: ElementRef,
    protected userService: CommonUserService,
    protected localizationService: ILocalizationService,
    public auth: IAuthManager,
    public config: IApplicationConfigurationManager,
    public profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    public routerService: Router,
    public renderer: Renderer2,
    private vPortalUserMenuService: IVPortalUserMenuService
  ) {
    if (!auth.isAuthenticated()) {
      return;
    }

    this.updateUserProfile();

    this.config.configUpdate$.subscribe(() => {
      this.updateUserProfile();
    });
    
    this.vPortalUserMenuService.refreshRequested.subscribe((result) => {
      this.profileItems =  this.vPortalUserMenuService.userMenuItemTree.filter((obj1, i, arr) => 
        arr.findIndex(obj2 => 
          JSON.stringify(obj2) === JSON.stringify(obj1)
        ) === i
      );
      
    });
  }

  ngOnDestroy(): void {
    
  }

  ngAfterViewInit(): void {
    const isDescendant = (el, parentId) => {
      let isChild = false
    
      if (el.id === parentId) { //is this the element itself?
        isChild = true
      }
    
      // eslint-disable-next-line no-cond-assign
      while (el = el.parentNode) {
        if (el.id == parentId) {
          isChild = true
        }
      }
      
      return isChild
    }
    this.renderer.listen(
      'document',
      'click',
      (event) => {
        
          const isOutsideClicked = !isDescendant(event.target,'app-layout-menu-profile');
          if (isOutsideClicked) {
            this.layoutService.config.update((config) => ({
              ...config,
              menuProfileActive: false,
            }));
          }
      }
  );
  }

  toggleMenu() {
    this.layoutService.onMenuProfileToggle();
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
        this.profileService.fillUserProfileRoutes();
      });
  }

  get isHorizontal() {
    return this.layoutService.isHorizontal() && this.layoutService.isDesktop();
  }

  get menuProfileActive(): boolean {
    return this.layoutService.config().menuProfileActive;
  }

  get menuProfilePosition(): string {
    return this.layoutService.config().menuProfilePosition;
  }

  get isTooltipDisabled(): boolean {
    return !this.layoutService.isSlim();
  }


  isCurrentRoute(route: string): boolean {
    return this.routerService.url === route;
  }

  login() {
    this.auth.navigateToLogin();
  }
}
