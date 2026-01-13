
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import { Component, Input } from "@angular/core";
import { RoleService } from '@eleon/tenant-management-proxy';
import { RoleUserLookupDto } from '@eleon/tenant-management-proxy';
import { finalize } from "rxjs";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";

@Component({
  standalone: false,
  selector: "app-role-users-management",
  templateUrl: "./role-users-management.component.html",
  styleUrl: "./role-users-management.component.scss",
})
export class RoleUsersManagementComponent {
  role: IdentityRoleDto;
  showDialog: boolean = false;
  loading: boolean = false;
  users: RoleUserLookupDto[];
  rowsCount: number = 5;
  totalRecords: number;
  selectingNewUsers: boolean = false;
  newUserFirstIndex: number = 0;
  roleUserFirstIndex: number = 0;
  searchQuery: string = "";

  constructor(
    private roleService: RoleService,
    private msgService: LocalizedMessageService,
    private confirmationService: LocalizedConfirmationService
  ) {}

  public show(role: IdentityRoleDto): void {
    this.role = role;
    this.selectingNewUsers = false;
    this.showDialog = true;
    this.users = null;
    this.searchQuery = "";
    this.loadUsers();
  }

  public close(): void {
    this.showDialog = false;
    this.users = null;
  }

  public startSelectingNewUsers(): void {
    this.users = null;
    this.selectingNewUsers = true;
    this.searchQuery = "";
    this.loadUsers();
  }

  public cancelSelectingNewUsers(): void {
    this.show(this.role);
    this.roleUserFirstIndex = 0;
  }

  public addNewUserToRole(row: RoleUserLookupDto): void {
    this.loading = true;
    this.roleService
      .addUserToRoleByInput({ userId: row.user.id, role: this.role.name })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::RoleUsersManagement:AddedNewUserToRole",
          this.getUserName(row),
          this.role.name
        );

        this.cancelSelectingNewUsers();
      });
  }

  public onRowRemove = (row: RoleUserLookupDto): void => {
    this.confirmationService.confirm(
      "TenantManagement::RoleUsersManagement:ConfirmRemoveUser",
      () => {
        this.loading = true;
        this.roleService
          .removeUserFromRoleByInput({
            userId: row.user.id,
            role: this.role.name,
          })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(() => {
            this.loadUsers();
            this.msgService.success(
              "TenantManagement::RoleUsersManagement:RemovedNewUserFromRole",
              this.getUserName(row),
              this.role.name
            );
          });
      }
    );
  };

  public getUserName(row: RoleUserLookupDto): string {
    return row.user.name?.length
      ? row.user.surname?.length
        ? row.user.name + " " + row.user.surname
        : row.user.name
      : row.user.userName;
  }

  public getRowProvidersString(row: RoleUserLookupDto): string {
    return row.providers.join(", ");
  }

  private loadUsers(): void {
    if (!this.role || !this.showDialog) {
      return;
    }

    this.loading = true;
    this.roleService
      .getUsersInRoleByInput({
        roleName: this.role.name,
        skipCount: this.selectingNewUsers
          ? this.newUserFirstIndex
          : this.roleUserFirstIndex,
        maxResultCount: this.rowsCount,
        exclusionMode: this.selectingNewUsers,
        userNameFilter: this.searchQuery,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((users) => {
        this.users = users.items;
        this.totalRecords = users.totalCount;
      });
  }

  reload() {
      if(this.selectingNewUsers){
        this.newUserFirstIndex = 0;
      }else{
        this.roleUserFirstIndex = 0;
      }
      this.loadUsers();
  }

  pageChange(event) {
    if(this.selectingNewUsers){
      this.newUserFirstIndex = event.first;
      this.rowsCount = event.rows;
    }else{
      this.roleUserFirstIndex = event.first;
      this.rowsCount = event.rows;
    }
  }
}
