import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { LazyLoadEvent, MenuItem } from "primeng/api";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";
import { RoleService } from '@eleon/tenant-management-proxy';
import { IdentityUserExtendedComponent } from "../identity-user-extended/identity-user-extended.component";
import { IdentityRoleDto } from '@eleon/tenant-management-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { SplitButton } from "primeng/splitbutton";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { PAGE_CONTROLS, PageControls, contributeControls } from "@eleon/primeng-ui.lib";
import { CommonRoleDto } from '@eleon/tenant-management-proxy';
import { SUPER_ADMIN_ROLE } from '../const/identity-constants'

@Component({
  standalone: false,
  selector: "app-role-dashboard",
  templateUrl: "./role-dashboard.component.html",
  styleUrl: "./role-dashboard.component.scss",
})
export class RoleDashboardComponent implements OnInit {
  readonly rowsCount: number = 10;
  readonly defaultSortField: string = "name";
  readonly defaultSortOrder: string = "desc";

  totalRecords: number = 0;
  rows: CommonRoleDto[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  searchQueryText: string;
  viewportBreakpoints = viewportBreakpoints;
  items: MenuItem[];
  @ViewChild(IdentityUserExtendedComponent)
  identityUserExtendedComponent!: IdentityUserExtendedComponent;
  selectedRole = {} as IdentityRoleDto;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  @ViewChild("splitButton") splitButton: SplitButton;

  SUPER_ADMIN_ROLE = SUPER_ADMIN_ROLE;
  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.reloadRoles(),
    }),
    PAGE_CONTROLS.ADD({
      key: "TenantManagement::Role:Add",
      icon: "pi pi-plus",
      severity: "info",
      loading: () => false,
      disabled: () => false,
      action: () => {
        this.displayCreateDialog = true;
      },
    }),
  ]);
  
  constructor(
    public localizationService: ILocalizationService,
    public router: Router,
    public roleService: RoleService,
    public identityRoleService: RoleService,
    public msgService: LocalizedMessageService,
    public confirmationService: LocalizedConfirmationService
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: this.localizationService.instant("TenantManagement::Role:Edit"),
        command: (x) => {
          if(this.selectedRole.name == SUPER_ADMIN_ROLE){
            this.msgService.error(
              "TenantManagement::Role:Edit:SuperAdminsPermissionManage"
            );
            return;
          }
          this.displayEditDialog = true;
        },
      },
      {
        label: this.localizationService.instant(
          "Infrastructure::ManagePermissions"
        ),
        command: (x) => {
          if(this.selectedRole.name == SUPER_ADMIN_ROLE){
            this.msgService.error(
              "TenantManagement::Role:Edit:SuperAdminsPermissionManage"
            );
            return;
          }
          this.identityUserExtendedComponent.openRolePermissionManagement(
            this.selectedRole
          );
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::RoleUsersManagement:Menu"
        ),
        command: (x) => {
          this.identityUserExtendedComponent.openRoleUsersManagement(
            this.selectedRole
          );
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::RoleOrgUnitsManagement:Menu"
        ),
        command: (x) => {
          this.identityUserExtendedComponent.openRoleOrgUnitsManagement(
            this.selectedRole
          );
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::Role:Delete"
        ),
        command: (x) => {
          if(this.selectedRole.name == SUPER_ADMIN_ROLE){
            this.msgService.error(
              "TenantManagement::Role:Edit:SuperAdminsPermissionManage"
            );
            return;
          }
          this.deleteRole();
        },
      },
    ];
  }

  deleteRole(){
    if(this.selectedRole.name == SUPER_ADMIN_ROLE){
      this.msgService.error(
        "TenantManagement::Role:Delete:CantDeleteSuperAdmin"
      );
      return;
    }
    this.confirmationService.confirm(
      "TenantManagement::Role:Delete:Confirmation",
      () => {
        try {
          this.identityRoleService
            .delete(this.selectedRole.id)
            .subscribe((reply) => {
              this.msgService.success(
                "TenantManagement::Role:Delete:Success"
              );
              this.reloadRoles();
            });
        } catch (error) {
          this.msgService.success("TenantManagement::Role:Delete:Error");
        }
      }
    );
  }

  selectRole(row: IdentityRoleDto) {
    this.selectedRole = row;
  }

  loadRoles(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || this.defaultSortField;
    const eventSortOrder = event.sortOrder
      ? event.sortOrder > 0
        ? "asc"
        : "desc"
      : null;
    const sortOrder: string =
      sortField === this.defaultSortField
        ? eventSortOrder ?? this.defaultSortOrder
        : eventSortOrder;
    const sorting: string = sortField + " " + sortOrder;

    this.roleService
      .getList({
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
        filter: this.searchQueryText
      })
      .subscribe((rows) => {
        this.rows = rows.items;
        this.totalRecords = rows.totalCount;
        this.loading = false;
      });
  }

  reloadRoles() {
    if (this.lastLoadEvent != null) this.loadRoles(this.lastLoadEvent);
  }

  search(event) {
    this.reloadRoles();
  }

  addRole(event) {
    this.displayCreateDialog = false;
    this.reloadRoles();
  }

  updateRole(event) {
    this.displayCreateDialog;
    this.displayEditDialog = false;
    this.reloadRoles();
  }

  closeCreateModal(event) {
    this.displayCreateDialog = false;
  }

  closeEditModal(event) {
    this.displayEditDialog = false;
  }

  click(event: SplitButton, eventClick: MouseEvent): void {
    setTimeout(() => {
      event.onDropdownButtonClick(eventClick);
    }, 0);
  }

  clear(){
    this.searchQueryText = "";
    this.reloadRoles();
  }
}
