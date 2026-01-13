import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import { Component } from "@angular/core";
import { OrganizationUnitService } from '@eleon/tenant-management-proxy';
import { CommonOrganizationUnitDto } from '@eleon/tenant-management-proxy';
import { ReplaySubject, finalize } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { OrganizationUnitSelectionEvent } from '../../organization-units/shared/organization-units-selection-tree/organization-unit-selection-event';

@Component({
  standalone: false,
  selector: "app-role-org-units-management",
  templateUrl: "./role-org-units-management.component.html",
  styleUrl: "./role-org-units-management.component.scss",
})
export class RoleOrgUnitsManagementComponent {
  role: IdentityRoleDto;
  orgUnits: CommonOrganizationUnitDto[];
  showDialog: boolean = false;
  loading: boolean = false;
  defaultSelectedOrganizationUnits: ReplaySubject<CommonOrganizationUnitDto[]>;

  constructor(
    private orgUnitService: OrganizationUnitService,
    private msgService: LocalizedMessageService,
    public pageStateService: PageStateService,
    public confirmationService : LocalizedConfirmationService,
    public localizationService: ILocalizationService,
  ) {}

  public show(role: IdentityRoleDto): void {
    this.role = role;
    this.showDialog = true;
    this.orgUnits = null;
    this.defaultSelectedOrganizationUnits = new ReplaySubject<
      CommonOrganizationUnitDto[]
    >(1);
    this.loadOrgUnits();
  }

  public cancel(): void {
    if(this.pageStateService.isDirty){
      this.confirmationService.confirm(
        'Infrastructure::ConfirmLeavingDirty',
        () => {
          this.pageStateService.setNotDirty();
          this.role = null;
          this.defaultSelectedOrganizationUnits = null;
          this.showDialog = false;
        });
    }
    else{
      this.role = null;
      this.defaultSelectedOrganizationUnits = null;
      this.showDialog = false;
    }
  }

  public loadOrgUnits(): void {
    this.loading = true;
    this.orgUnitService
      .getRoleOrganizationUnitsByRoleName(this.role.name)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((orgUnits) => {
        this.orgUnits = orgUnits;
        this.defaultSelectedOrganizationUnits.next(this.orgUnits);
      });
  }

  public save(): void {
    this.pageStateService.setNotDirty();
    this.loading = true;
    this.orgUnitService
      .setRoleOrganizationUnitsByInput({
        roleName: this.role.name,
        organizationUnitIds: this.orgUnits.map((x) => x.id),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::RoleOrgUnitsManagement:SaveSuccess"
        );
        this.cancel();
      });
  }

  public onOrgUnitsSelected(event: OrganizationUnitSelectionEvent): void {
    this.pageStateService.setDirty();
    this.orgUnits = event.selectedOrgUnits;
  }
}
