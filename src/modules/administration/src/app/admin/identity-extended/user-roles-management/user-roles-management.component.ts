import {
  IdentityRoleDto,
  IdentityUserDto,
  CommonUserService,
} from '@eleon/tenant-management-proxy';
import { Component, OnInit } from "@angular/core";
import { RoleService } from '@eleon/tenant-management-proxy';
import { UserRoleLookupDto } from '@eleon/tenant-management-proxy';
import { ReplaySubject, finalize, firstValueFrom } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";


import { IPermissionService } from '@eleon/angular-sdk.lib';
type GrantedRole = UserRoleLookupDto & {
  providersString: string;
  granted: boolean;
};

@Component({
  standalone: false,
  selector: "app-user-roles-management",
  templateUrl: "./user-roles-management.component.html",
  styleUrl: "./user-roles-management.component.scss",
})
export class UserRolesManagementComponent implements OnInit {
  assignableRoles$ = new ReplaySubject<IdentityRoleDto[]>(1);
  user: IdentityUserDto;
  showDialog: boolean = false;
  loading: boolean = false;
  roles: GrantedRole[];
  filteredRoles: GrantedRole[];
  searchQuery: string = "";
  mode: string = "";
  searchOnlySelected: boolean = false;
  totalRecords: number = 0;
  canManageRoles: boolean = false;

  // get userRoles(): IdentityRoleDto[]{
  //   return this.roles?.filter(r => r.granted && r.editable)?.map(r => ({ roleName: r.roleName } as any)) || [];
  // }

  constructor(
    private roleService: RoleService,
    private userService: CommonUserService,
    private msgService: LocalizedMessageService,
    private pageStateService: PageStateService,
    private confirmationService: LocalizedConfirmationService,
    private permissionService: IPermissionService
  ) {
    // this.themeMode.mode.subscribe(x=>{
    //   this.mode = x;
    // })
    this.canManageRoles = this.permissionService.getGrantedPolicy('AbpIdentity.Users.Update');
  }

  public ngOnInit(): void {
    this.userService
      .getAssignableRoles()
      .subscribe((roles) => this.assignableRoles$.next(roles.items));
  }

  public show(user: IdentityUserDto): void {
    this.user = user;
    this.showDialog = true;
    this.roles = [];
    this.filteredRoles = [];
    this.searchQuery = "";
    this.loadRoles();
    this.totalRecords = 0;
  }

  public cancel(): void {
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm(
        "Infrastructure::ConfirmLeavingDirty",
        () => {
          this.pageStateService.setNotDirty();
          this.showDialog = false;
        }
      );
    } else {
      this.showDialog = false;
    }
  }

  // onRolesSelected(roles){
  //   const roleNames = roles.map(r => r.roleName);
  //   this.roles.forEach(r => r.granted = roleNames.includes(r.roleName));
  //   this.save();
  //   this.showDialog = false;
  // }

  public save = (): void => {
    this.loading = true;
    this.userService
      .updateRoles(this.user.id, {
        roleNames: this.roles
          .filter((r) => r.granted && r.editable)
          .map((r) => r.roleName),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.success(
          "TenantManagement::UserRolesManagement:SaveSuccess"
        );
        this.pageStateService.setNotDirty();
        this.showDialog = false;
      });
  };

  public getUserName(): string {
    if (!this.user) {
      return "";
    }

    return this.user.name?.length
      ? this.user.name + " " + this.user.surname
      : this.user.userName;
  }

  public filter(): void {
    const baseRoles = this.searchOnlySelected
      ? this.roles.filter((x) => x.granted)
      : this.roles;

    if (!this.searchQuery?.length) {
      this.filteredRoles = baseRoles;
    } else {
      this.filteredRoles = baseRoles.filter((x) =>
        x.roleName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.totalRecords = this.filteredRoles?.length;
  }

  private loadRoles(): void {
    this.loading = true;
    this.roleService
      .getUserRolesLookupByUserId(this.user.id)
      .subscribe(async (grantedRoles) => {
        const assignableRoles = await firstValueFrom(this.assignableRoles$);

        this.roles = assignableRoles.map((r) => {
          const granted = grantedRoles.find((x) => x.roleName === r.name);
          return {
            roleName: r.name,
            providers: granted?.providers,
            editable: granted?.editable ?? true,
            providersString: granted?.providers?.length
              ? "(" + granted.providers.join(", ") + ")"
              : null,
            granted: !!granted,
          } satisfies GrantedRole;
        });

        this.filter();

        this.loading = false;
      });
  }

  getRowString(role: GrantedRole): string {
    let msg = role?.roleName;
    if (!role?.providersString?.length) {
      return msg;
    } else {
      msg = msg + " " + role?.providersString;
    }
    return msg;
  }

  selectRole(role: GrantedRole): void {
    if (!role) {
      return;
    }

    if (role.editable) {
      role.granted = !role.granted;
    }
  }
}
