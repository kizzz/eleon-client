import { Component, Input, OnInit } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { contributeControls, PAGE_CONTROLS, PageControls } from '@eleon/primeng-ui.lib'
import { of } from 'rxjs'

@Component({
  standalone: false,
  selector: "app-tenant-domains",
  templateUrl: "./tenant-domains.component.html",
  styleUrl: "./tenant-domains.component.scss",
})
export class TenantDomainsComponent implements OnInit {
  tenantId: string;

  title = "TenantManagement::TenantSettings:TenantDomains";

  constructor(
    private configStateService: IApplicationConfigurationManager
  ) {}

  public ngOnInit(): void {
    this.tenantId = this.configStateService.getAppConfig().currentUser?.tenantId;
  }

  save = () => of();
  reset = () => of();
}
