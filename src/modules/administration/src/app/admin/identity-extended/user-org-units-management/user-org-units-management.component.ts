;
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import { Component } from "@angular/core";
import { OrganizationUnitService } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { ConfirmationService } from "primeng/api";
import { ReplaySubject, Subject, finalize } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";

import { IPermissionService, ILocalizationService } from '@eleon/angular-sdk.lib';
import { OrganizationUnitSelectionEvent } from '../../organization-units/shared/organization-units-selection-tree/organization-unit-selection-event';
@Component({
  standalone: false,
  selector: "app-user-org-units-management",
  templateUrl: "./user-org-units-management.component.html",
  styleUrl: "./user-org-units-management.component.scss",
})
export class UserOrgUnitsManagementComponent {
  user: IdentityUserDto;
  orgUnits: CommonOrganizationUnitDto[];
  showDialog: boolean = false;
  loading: boolean = false;
  defaultSelectedOrganizationUnits: ReplaySubject<CommonOrganizationUnitDto[]>;
  allowUpdate: boolean = false;

  constructor(
    private orgUnitService: OrganizationUnitService,
    private msgService: LocalizedMessageService,
    public pageStateService: PageStateService,
    public confirmationService: ConfirmationService,
    public localizationService: ILocalizationService,
    private permissionService: IPermissionService
  ) {
    this.allowUpdate = this.permissionService.getGrantedPolicy(
      'AbpIdentity.Users.Update'
    );
  }

  public show(user: IdentityUserDto): void {
    this.user = user;
    this.showDialog = true;
    this.orgUnits = null;
    this.defaultSelectedOrganizationUnits = new ReplaySubject<
      CommonOrganizationUnitDto[]
    >(1);
    this.loadOrgUnits();
  }

  public async cancel(): Promise<void> {
    if (!(await this.pageStateService.confirmResettingDirty())) {
      return;
    }
    
    this.user = null;
    this.defaultSelectedOrganizationUnits = null;
    this.showDialog = false;
  }

  public loadOrgUnits(): void {
    this.loading = true;
    this.orgUnitService
      .getUserOrganizationUnitsByUserId(this.user.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((orgUnits) => {
        this.orgUnits = orgUnits;
        this.defaultSelectedOrganizationUnits.next(this.orgUnits);
      });
  }

  public save(): void {
    this.loading = true;
    this.pageStateService.setNotDirty();
    this.orgUnitService
      .setUserOrganizationUnitsByInput({
        userId: this.user.id,
        organizationUnitIds: this.orgUnits.map((x) => x.id),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::UserOrgUnitsManagement:SaveSuccess"
        );
        this.cancel();
      });
  }

  public getUserName(): string {
    if (!this.user) {
      return "";
    }

    return this.user.name?.length
      ? this.user.name + " " + this.user.surname
      : this.user.userName;
  }

  public onOrgUnitsSelected(event: OrganizationUnitSelectionEvent): void {
    this.pageStateService.setDirty();
    this.orgUnits = event.selectedOrgUnits;
  }
}
