
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import { Component, Injectable, OnInit, ViewChild } from "@angular/core"
// import { EmployeeDetailsDialogComponent } from "../employee-details/employee-details-dialog/employee-details-dialog.component"
import { PermissionManagementComponent } from "../permission-management/permission-management.component"
import { RoleOrgUnitsManagementComponent } from "../role-org-units-management/role-org-units-management.component"
import { RoleUsersManagementComponent } from "../role-users-management/role-users-management.component"
import { UserDetailsDialogComponent } from "../user-details/user-details-dialog/user-details-dialog.component"
import { UserOrgUnitsManagementComponent } from "../user-org-units-management/user-org-units-management.component"
import { UserRolesManagementComponent } from "../user-roles-management/user-roles-management.component"
import { UserSessionManagementComponent } from '../user-session-management/user-session-management.component'
import { RoleService } from '@eleon/tenant-management-proxy';

import { ILocalizationService, ILogsDialogService } from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: "root",
})
@Component({
  standalone: false,
  selector: "app-identity-user-extended",
  templateUrl: "./identity-user-extended.component.html",
  styleUrls: ["./identity-user-extended.component.scss"],
})
export class IdentityUserExtendedComponent implements OnInit {
  @ViewChild(PermissionManagementComponent)
  permissionManagementComponent!: PermissionManagementComponent;

  @ViewChild(RoleUsersManagementComponent)
  roleUsersManagementComponent!: RoleUsersManagementComponent;

  @ViewChild(UserRolesManagementComponent)
  userRolesManagementComponent!: UserRolesManagementComponent;

  @ViewChild(UserOrgUnitsManagementComponent)
  userOrgUnitsManagementComponent!: UserOrgUnitsManagementComponent;

  @ViewChild(RoleOrgUnitsManagementComponent)
  roleOrgUnitsManagementComponent!: RoleOrgUnitsManagementComponent;

  @ViewChild(UserDetailsDialogComponent)
  userDetailsManagementComponent!: UserDetailsDialogComponent;

  // @ViewChild(EmployeeDetailsDialogComponent)
  // employeeDetailsDialogComponent!: EmployeeDetailsDialogComponent;

  @ViewChild(UserSessionManagementComponent)
  sessionManagementComponent!: UserSessionManagementComponent;

  displayUserIsolation: boolean = false;
  user: IdentityUserDto;

  constructor(
    public localizationService: ILocalizationService,
    private roleService: RoleService,
    private logsDialogService: ILogsDialogService,
  ) {}

  ngOnInit(): void {
    return;
  }

  openUserEdit(record: IdentityUserDto =  null) {
    if(record != null){
      this.user = new Proxy(record, {
        get: (target, prop) => target[prop] || "",
      });
    }
    this.userDetailsManagementComponent.show(this.user);
  }

  // openUserQuickView(record: IdentityUserDto) {
  //   this.user = new Proxy(record, {
  //     get: (target, prop) => target[prop] || "—",
  //   });
  //   this.employeeDetailsDialogComponent.show(this.user);
  // }

  // openUserIsolationSettings(record: IdentityUserDto) {
  //   this.user = new Proxy(record, {
  //     get: (target, prop) => target[prop] || "—",
  //   });
  //   this.displayUserIsolation = true;
  // }

  openUserPermissionManagement(record: IdentityUserDto) {
    this.user = new Proxy(record, {
      get: (target, prop) => target[prop] || "",
    });
    this.permissionManagementComponent.showUser(this.user);
  }
  
  openUserRolesManagement(record: IdentityUserDto) {
    this.user = new Proxy(record, {
      get: (target, prop) => target[prop] || "",
    });
    this.userRolesManagementComponent.show(this.user);
  }
  
  openUserOrgUnitsManagement(record: IdentityUserDto) {
    this.user = new Proxy(record, {
      get: (target, prop) => target[prop] || "",
    });
    this.userOrgUnitsManagementComponent.show(this.user);
  }

  openSessionManagement(record: IdentityUserDto){
    this.sessionManagementComponent.show(record);
  }

  openSecurityLogs(record: IdentityUserDto){
    this.logsDialogService.openSecurityLogs(record.id);
  }

  openAuditLogs(record: IdentityUserDto){
    this.logsDialogService.openAuditLogs(record.id);
  }

  openRolePermissionManagement(record: IdentityRoleDto) {
    this.permissionManagementComponent.showRole(record);
  }

  openRoleUsersManagement(record: IdentityRoleDto) {
    this.roleUsersManagementComponent.show(record);
  }

  openRoleOrgUnitsManagement(record: IdentityRoleDto) {
    this.roleOrgUnitsManagementComponent.show(record);
  }
}
