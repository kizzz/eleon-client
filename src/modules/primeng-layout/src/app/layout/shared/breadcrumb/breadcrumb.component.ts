import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { ActivatedRoute, NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PageStateService, DetectCanDeactivateGuardService } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { IBreadcrumbsService, ILayoutService, ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [ SharedModule, BreadcrumbModule, TooltipModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

  breadcrumbs: MenuItem[] = [];

  loading = false;

  home: MenuItem | undefined;
  private detectCanDeactivateGuardSubscription: Subscription;
  hasCanDeactivateSaveGuard: boolean = false;
  
  constructor(public layoutService: ILayoutService,
    public localizationService: ILocalizationService,
    private router: Router,
    private breadcrumbsService: IBreadcrumbsService,
    private pageStateService: PageStateService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    public detectCanDeactivateGuardService: DetectCanDeactivateGuardService,
    private confirmationService: ConfirmationService) {
      this.routingChanges();
    }

  ngOnInit() {
    this.getBreadCrumbs();
    this.home = { icon: 'fa fa-home', routerLink: '/home', tooltip: 'Home' };
    this.detectCanDeactivateGuardSubscription = this.detectCanDeactivateGuardService.getResult().subscribe((status) => {
      this.hasCanDeactivateSaveGuard = status;
    });
  }

  getBreadCrumbs(){
    this.breadcrumbsService.breadcrumbs$.subscribe(breadcrumbs => {
      this.loading = true;
      this.breadcrumbs = this.firstAndLastElementsWithEllipsis(breadcrumbs);
      this.cdr.detectChanges();
      this.breadcrumbs = [...this.breadcrumbs];
      this.loading = false;
    });
    
  }

  firstAndLastElementsWithEllipsis(arr: MenuItem[]) {
    // Check if the array is empty
    if (arr.length === 0) {
      return [];
    }
    // Check if the array has only one element
    if (arr.length === 1) {
      return [arr[0]];
    }
    // If the array has more than two elements, include "..." in the middle
    // if (arr.length > 2) {
    //   return [arr[0], { label: '...', tooltip: arr.slice(1, arr.length - 1).join('/') }, arr[arr.length - 1]];
    // }
    
    // If the array has more than two elements show all
    if (arr.length > 2) {
      return arr;
    }
    // If the array has exactly two elements (and they are different), return them
    return [arr[0], arr[arr.length - 1]];
  }

  routingChanges() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.getBreadCrumbs();
        this.detectCanDeactivateGuardService.requestCheck();
      }
    });
  }

  back() {
    if(this.hasCanDeactivateSaveGuard && this.pageStateService.isDirty){
      this.confirmationService?.confirm({
        message: this.localizationService.instant("Infrastructure::CannotQuitWhileEditing"),
        accept: () =>{
          this.pageStateService.setDirty();
          return;
        },
        acceptLabel: this.localizationService.instant("Infrastructure::Ok"),
        acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
        icon: "pi pi-exclamation-triangle text-warning",
        rejectVisible: false,
      });
    }
    else{
      this.pageStateService.confirmResettingDirty().then((result) => {
        if (!result) return;
        const oldPage = this.breadcrumbsService.back();
        if(!!oldPage){
          this.router.navigate([oldPage]);
        }
      });
    }
  }
  
  refresh() {
    this.pageStateService.confirmResettingDirty().then((result) => {
      if (!result) return;
      location.reload();
    });
  }

  ngOnDestroy() {
    if (this.detectCanDeactivateGuardSubscription) {
        this.detectCanDeactivateGuardSubscription.unsubscribe();
    }
  }
}
