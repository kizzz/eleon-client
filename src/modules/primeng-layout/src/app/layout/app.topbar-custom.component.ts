import { Component} from "@angular/core";
import { MenuItem } from "primeng/api";
import { TopBarMenuService } from "./service/top-bar-menu.service";
import { IVPortalTopbarService, VPortalTopbarItem } from '@eleon/angular-sdk.lib';
import { Router } from "@angular/router";

@Component({
  standalone: false,
  selector: "app-topbar-custom",
  templateUrl: "./app.topbar-custom.component.html",
  styleUrl: "./app.topbar-custom.component.scss",
})
export class AppTopBarCustomComponent {
  items!: MenuItem[];

  constructor(
    public vportalTopbarService: IVPortalTopbarService,
    public topBarMenuService: TopBarMenuService,
    public router: Router
  ) {
    this.vportalTopbarService.refreshRequested.subscribe((result) => {
      this.items = [];
      this.items = this.parseToMenuItems(this.vportalTopbarService.topbarItems);
    })
  }

  public ngOnInit(): void {
    this.vportalTopbarService.clear();
    this.topBarMenuService.initTopBarMenu();
  }

  onMenuItemClick(event: any): void {
    if (!event.item.routerLink) {
      event.originalEvent.preventDefault();
    }
    else{
      this.router.navigate([event.item.routerLink]);
    }
  }


  parseToMenuItems(topbarItems: VPortalTopbarItem[]): MenuItem[] {
    return topbarItems.map((topbarItem: VPortalTopbarItem) => ({
      label: topbarItem.label,
      icon: topbarItem.icon,
      routerLink: topbarItem.routerLink,
      iconClass: topbarItem.icon,
      url: topbarItem.routerLink,
      command: (event: any) => this.onMenuItemClick(event),
      items: topbarItem.items ? this.parseToMenuItems(topbarItem.items) : undefined,
    }));
  }
}
