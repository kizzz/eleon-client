import { ChangeDetectorRef, Component, ElementRef, Host, HostBinding, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from './app.menu.service';

import { DomHandler } from 'primeng/dom';
import { AppSidebarComponent } from './app.sidebar.component';

import { ILayoutService, IVPortalMenuService } from '@eleon/angular-sdk.lib';
@Component({
    standalone: false,
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-menuitem]',
    template: `
		<ng-container>
            <div *ngIf="root && item.visible !== false" class="layout-menuitem-root-text" [ngClass]="{ 'py-0': !item.label || item.label.length === 0 }">
                <span>{{item.label | abpLocalization}}</span>
                <i class="layout-menuitem-root-icon pi pi-fw pi-ellipsis-h"></i>
            </div>
			<a *ngIf="(!item.routerLink || item.items?.length) && item.visible !== false" [attr.href]="item.url" (click)="itemClick($event)"  (mouseenter)="onMouseEnter()"
			   [ngClass]="item.class" [attr.target]="item.target" tabindex="0" pRipple [pTooltip]="item.label  | abpLocalization" [tooltipDisabled]="!(isSlim && root && !active)">
               <!--Icon for drawer-->
                <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
				<i class="menu-icon"><i [ngClass]="item.icon"></i></i>
				<span class="layout-menuitem-text">{{item.label  | abpLocalization}}</span>
                
                <span *ngIf="item?.showCount && item?.items?.length">&nbsp;
                (<span class="count">{{item?.items?.length}}</span>)
                </span>
				<i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items?.length"></i>
			</a>
			<a *ngIf="(item.routerLink && !item.items?.length) && item.visible !== false" (click)="itemClick($event)" (mouseenter)="onMouseEnter()" [ngClass]="item.class" 
			   [routerLink]="item.routerLink" routerLinkActive="active-route" [routerLinkActiveOptions]="item.routerLinkActiveOptions||{ paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
               [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment" 
               [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state" [queryParams]="item.queryParams"
               [attr.target]="item.target" tabindex="0" pRipple [pTooltip]="item.label  | abpLocalization" [tooltipDisabled]="!(isSlim && root)">
               <!--Icon for drawer-->
               <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
               <i class="menu-icon"><i [ngClass]="item.icon"></i></i>
				<span class="layout-menuitem-text flex gap-2 align-items-end" [pTooltip]="item?.tooltip" tooltipPosition="right"
                    [tooltipDisabled]="!item?.tooltip?.length">
                        {{item.label  | abpLocalization}}
                    <b *ngIf="item?.showBang">
                        <b class="bang">!</b>
                    </b>
                    <b *ngIf="item?.showIcon">
                    <i [ngClass]="item.actionIcon" class="bang" style="cursor: pointer; font-size: medium"
                        (click)="clickOnActionIcon(item, $event)"></i>
                    </b>

                    <span *ngIf="item?.showCount && item?.count > 0">&nbsp;
                        (<span [ngStyle]="{ 'color': item.color }">{{item.count}}</span>)
                    </span>
                </span>
				<i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items?.length"></i>
			</a>

			<ul #submenu *ngIf="item.items?.length && item.visible !== false" [@children]="submenuAnimation" (@children.done)="onSubmenuAnimated($event)">
				<ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
					<li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
				</ng-template>
			</ul>
		</ng-container>
    `,
    animations: [
        trigger('children', [
            state('collapsed', style({
                height: '0'
            })),
            state('expanded', style({
                height: '*'
            })),
            state('hidden', style({
                display: 'none'
            })),
            state('visible', style({
                display: 'block'
            })),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ],
    styles: [
        `
        .count{
            color: var(--green-500);
        }

        .bang{
            color: var(--red-500);
        }
        `
    ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

    @Input() item: any;

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    @ViewChild('submenu') submenu!: ElementRef;

    active = false;

    menuSourceSubscription: Subscription;

    menuResetSubscription: Subscription;

    key: string = "";

    constructor(
        public layoutService: ILayoutService,
        private cd: ChangeDetectorRef,
        public router: Router, 
        private menuService: MenuService, 
        private appSidebar: AppSidebarComponent,
        private vPortalMenuItemClickHandlerService: IVPortalMenuService) {
        this.menuSourceSubscription = this.menuService.menuSource$.subscribe(value => {
            Promise.resolve(null).then(() => {
                if (value.routeEvent) {
                    this.active = (value.key === this.key || value.key.startsWith(this.key + '-')) ? true : false;
                }
                else {
                    if (value.key !== this.key && !value.key.startsWith(this.key)) {
                        this.active = false;
                        this.item.expanded = false;
                    }
                }
            });
        });

        this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
            this.active = false;
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(params => {
                if (this.isSlimPlus || this.isSlim || this.isHorizontal) {
                    this.active = false;
                }
                else {
                    if (this.item.routerLink) {
                        this.updateActiveStateFromRoute();
                    }
                }
            });
    }

    ngOnInit() {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

        if (!(this.isSlimPlus || this.isSlim || this.isHorizontal) && this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    ngAfterViewChecked() {
        if (this.root && this.active && this.layoutService.isDesktop() && (this.layoutService.isHorizontal() || this.layoutService.isSlim()|| this.layoutService.isSlimPlus())) {
            this.calculatePosition(this.submenu?.nativeElement, this.submenu?.nativeElement.parentElement);
        }
    }

    updateActiveStateFromRoute() {
        let activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });

        if (activeRoute) {
            this.menuService.onMenuStateChange({key: this.key, routeEvent: true});
        }
    }

    onSubmenuAnimated(event: AnimationEvent) {
        if (event.toState === 'visible' && this.layoutService.isDesktop() && (this.layoutService.isHorizontal() || this.layoutService.isSlim()|| this.layoutService.isSlimPlus())) {
            const el = <HTMLUListElement> event.element;
            const elParent = <HTMLUListElement> el.parentElement;
            this.calculatePosition(el, elParent);
        }
    }

    calculatePosition(overlay: HTMLElement, target: HTMLElement) {
        if (overlay) {
            const { left, top } = target.getBoundingClientRect();
            const [vWidth, vHeight] = [window.innerWidth, window.innerHeight];
            const [oWidth, oHeight] = [overlay.offsetWidth, overlay.offsetHeight];
            const scrollbarWidth = DomHandler.calculateScrollbarWidth();
            const topbarEl = document.querySelector('.layout-topbar') as HTMLElement;
            const topbarHeight = topbarEl?.offsetHeight || 0;
            // reset
            overlay.style.top = '';
            overlay.style.left = '';
      
            if (this.layoutService.isHorizontal()) {
                const width = left + oWidth + scrollbarWidth;
                overlay.style.left = vWidth < width ? `${left - (width - vWidth)}px` : `${left}px`;
            } else if ( this.layoutService.isSlim() || this.layoutService.isSlimPlus()) {
                const topOffset = top - topbarHeight;
                const height = topOffset + oHeight + topbarHeight;
                overlay.style.top = vHeight < height ? `${topOffset - (height - vHeight)}px` : `${topOffset}px`;
            }
        }
    }

    itemClick(event: Event) {
        // avoid processing disabled items
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        // navigate with hover
        if (this.root && this.isSlim || this.isHorizontal || this.isSlimPlus) {
            this.layoutService.config().menuHoverActive = !this.layoutService.config().menuHoverActive;
        }


        // execute command
        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }

        // toggle active state
        if (this.item.items) {
            this.active = !this.active;
            this.item.expanded = !this.item.expanded;

            if (this.root && this.active && (this.isSlim || this.isHorizontal || this.isSlimPlus)) {
                this.layoutService.onOverlaySubmenuOpen();
            }
        }
        else {
            if (this.layoutService.isMobile()) {
                this.layoutService.config().staticMenuMobileActive = false;
            }

            if (this.isSlim || this.isHorizontal || this.isSlimPlus) {
                this.menuService.reset();
                this.layoutService.config().menuHoverActive = false;
            }
        }

        this.menuService.onMenuStateChange({key: this.key});
    }

    onMouseEnter() {
        // activate item on hover
        if (this.root && (this.isSlim || this.isHorizontal || this.isSlimPlus) && this.layoutService.isDesktop()) {
            if (this.layoutService.config().menuHoverActive) {
                this.active = true;
                this.item.expanded = true;
                this.menuService.onMenuStateChange({key: this.key});
            }
        }
    }

    clickOnActionIcon(item, event: Event){
        event.stopPropagation(); 
        event.preventDefault();
        this.vPortalMenuItemClickHandlerService.itemClicked(item);
    } 

    get submenuAnimation() {
        if (this.layoutService.isDesktop() && (this.layoutService.isHorizontal() || this.layoutService.isSlim()|| this.layoutService.isSlimPlus()))
            return this.active ? 'visible' : 'hidden';
        else {
            return this.root ? 'expanded' : (this.item.expanded ? 'expanded' : 'collapsed');
        }
    }

    get isHorizontal() {
        return this.layoutService.isHorizontal();
    }

    get isSlim() {
        return this.layoutService.isSlim();
    }
    get isSlimPlus() {
        return this.layoutService.isSlimPlus();
    }

    @HostBinding('class.active-menuitem') 
    get activeClass() {
        return this.active && !this.root;
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}
