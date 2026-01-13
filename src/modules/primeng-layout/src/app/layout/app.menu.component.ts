import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { ILayoutService, IVPortalMenuService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-menu",
  templateUrl: "./app.menu.component.html",
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];

  constructor(
    public layoutService: ILayoutService,
    public vportalMenuService: IVPortalMenuService
  ) {}

  ngOnInit() {
    this.model = this.vportalMenuService.menuItemTree;
    this.vportalMenuService.refreshRequested.subscribe((result) => {
      this.model = this.vportalMenuService.menuItemTree;
    })
  }
}
