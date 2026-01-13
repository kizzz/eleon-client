import { IImpersonationService, ILocalizationService, IPermissionService } from '@eleon/angular-sdk.lib';

import { CommonUserService } from '@eleon/tenant-management-proxy';
import { IdentityUserDto } from '@eleon/tenant-management-proxy';
import { Component, OnInit, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { handleError, viewportBreakpoints } from "@eleon/angular-sdk.lib"
import { FileHelperService } from '@eleon/primeng-ui.lib'
import { LocalizedConfirmationService, LocalizedMessageService } from "@eleon/primeng-ui.lib"
import { PAGE_CONTROLS, PageControls, contributeControls } from "@eleon/primeng-ui.lib"
import { LazyLoadEvent, MenuItem } from "primeng/api"
import { DialogService } from 'primeng/dynamicdialog'
import { FileSelectEvent, FileUpload } from "primeng/fileupload"
import { SplitButton } from "primeng/splitbutton"
import { IdentityUserExtendedComponent } from "../identity-user-extended/identity-user-extended.component"
import { UserCreateFromFileComponent } from "./user-create-from-file/user-create-from-file.component"
import { finalize } from 'rxjs'

@Component({
  standalone: false,
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html",
  styleUrl: "./user-dashboard.component.scss",
})
export class UserDashboardComponent implements OnInit {
  @ViewChild(FileUpload) fileUpload: FileUpload;
readonly rowsCount: number = 10;
  readonly defaultSortField: string = "name";
  readonly defaultSortOrder: string = "desc";

  totalRecords: number = 0;
  rows: CommonUserDto[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  searchQueryText: string;
  viewportBreakpoints = viewportBreakpoints;
  items: MenuItem[];
  @ViewChild(IdentityUserExtendedComponent)
  identityUserExtendedComponent!: IdentityUserExtendedComponent;
  selectedUser = {} as IdentityUserDto;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  @ViewChild("splitButton") splitButton: SplitButton;
  showCreateButtons: boolean = true;
  @PageControls()
  controls = contributeControls([
    {
      key: '',
      icon: 'fa-solid fa-upload',
      severity: '',
      show: () => this.showCreateButtons,
      loading: () => false,
      disabled: () => false,
      action: () => this.importUsers(null),
      tooltip: 'TenantManagement::ImportFromFile:Tooltip'
    },
		{
      key: '',
      icon: 'fa-solid fa-download',
      severity: '',
      show: () => this.showCreateButtons,
      loading: () => false,
      disabled: () => false,
      action: () => this.downloadUsers(),
      tooltip: 'TenantManagement::ExportToFile:Tooltip'
    },
    PAGE_CONTROLS.RELOAD({
      action: () => this.reloadUsers(),
    }),
    {
      key: 'TenantManagement::NewUser',
      icon: 'pi pi-plus',
      severity: '',
      show: () => this.showCreateButtons,
      loading: () => false,
      disabled: () => false,
      action: () => this.createUser(),
    },
  ])

  constructor(
    public localizationService: ILocalizationService,
    public router: Router,
    public userService: CommonUserService,
    public msgService: LocalizedMessageService,
    public dialogService: DialogService,
    public confirmationService: LocalizedConfirmationService,
    public fileHelper: FileHelperService,
    public impersonationService: IImpersonationService,
    public permissionService: IPermissionService,
  ) {
    this.showCreateButtons = this.permissionService.getGrantedPolicy('AbpIdentity.Users.Create');
  }

  ngOnInit(): void {
    this.items = [
      {
        label: this.localizationService.instant("TenantManagement::UserInfo"),
        command: (x) => {
          this.displayEditDialog = true;
        },
      },
      {
        label: this.localizationService.instant("TenantManagement::Sessions"),
        command: (x) => {
          this.identityUserExtendedComponent.openSessionManagement(
            this.selectedUser
          );
        }
      },
      {
        label: this.localizationService.instant("Infrastructure::UserSecurityLogs"),
        command: (x) => {
          this.identityUserExtendedComponent.openSecurityLogs(
            this.selectedUser
          );
        }
      },
      {
        label: this.localizationService.instant("Infrastructure::RequestLogs"),
        command: (x) => {
          this.identityUserExtendedComponent.openAuditLogs(
            this.selectedUser
          );
        }
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::LoginAsThisUser"
        ),
        command: (x) => {
          // if (this.selectedUser.isActive) {
            this.confirmationService.confirm(
              "TenantManagement::LoginAsUserConfirmation",
              () => {
                this.impersonationService.impersonate(this.selectedUser.id);
              },
              () => {
                return;
              }
            );
          // } else {
          //   this.msgService.error(
          //     "Infrastructure::CanNotImpersonateInactiveUser"
          //   );
          // }
        },
      },
      {
        label: this.localizationService.instant(
          "Infrastructure::ManagePermissions"
        ),
        command: (x) => {
          this.identityUserExtendedComponent.openUserPermissionManagement(
            this.selectedUser
          );
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::UserRolesManagement:Menu"
        ),
        command: (x) => {
          this.identityUserExtendedComponent.openUserRolesManagement(
            this.selectedUser
          );
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::UserOrgUnitsManagement:Menu"
        ),
        command: (x) => {
          this.identityUserExtendedComponent.openUserOrgUnitsManagement(
            this.selectedUser
          );
        },
      },
      {
        label: this.localizationService.instant(
          "Infrastructure::ResetLoginAttempts"
        ),
        command: (x) => {
          this.userService.ignoreLastUserOtp(this.selectedUser.id).subscribe(() => {
            this.msgService.success("Infrastructure::LoginAttemptsReset");
          });
        },
      },
      {
        label: this.localizationService.instant(
          "TenantManagement::User:Delete"
        ),
        command: (x) => {
          this.deleteUser();
        },
      },
    ];
  }

  selectUser(row: IdentityUserDto) {
    this.selectedUser = row;
  }

  deleteUser() {
    try {
      if (this.selectedUser.userName === 'SA'){
        this.msgService.error("TenantManagement::User:Delete:ErrorSAUser");
        return;
      }
      this.confirmationService.confirm(
        "TenantManagement::User:Delete:Confirmation",
        () => {
          this.userService
            .delete(this.selectedUser.id)
            .subscribe((reply) => {
              this.msgService.success("TenantManagement::User:Delete:Success");
              this.reloadUsers();
            });
        }
      );
    } catch (error) {
      this.msgService.success("TenantManagement::User:Delete:Error");
    }
  }

  loadUsers(event: LazyLoadEvent) {
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

    this.userService
      .getList({
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
        ignoreCurrentUser: false,
        filter: this.searchQueryText?.trim(),
				ignoredUsers: null
      })
      .subscribe((rows) => {
        this.rows = rows.items;
        this.selectedUser.phoneNumber;
        this.totalRecords = rows.totalCount;
        this.loading = false;
      });
  }

  reloadUsers() {
    if (this.lastLoadEvent != null) this.loadUsers(this.lastLoadEvent);
  }

  search(event) {
    this.reloadUsers();
  }

  closeCreateModal(event) {
    this.displayCreateDialog = false;
    this.reloadUsers();
  }

  closeEditModal(event) {
    this.displayEditDialog = false;
    this.reloadUsers();
  }

  click(event: SplitButton, eventClick: MouseEvent): void {
    setTimeout(() => {
      event.onDropdownButtonClick(eventClick);
    }, 0);
  }


  importUsers(event: FileSelectEvent) {
    const dialogRef = this.dialogService.open(UserCreateFromFileComponent, {
      header: this.localizationService.instant('TenantManagement::CreateFromFile'),
    });

    dialogRef.onClose.subscribe(result => {
      this.loadUsers(this.lastLoadEvent);
    })
  }

  createUser() {
    this.displayCreateDialog = true;
  }

  clear(){
    this.searchQueryText = "";
    this.reloadUsers();
  }

	downloadUsers(){
		this.userService.getList({ maxResultCount: 1000, skipCount: 0, sorting: 'creationTime asc' } as any)
			.pipe(finalize(() => this.loading = false),
			handleError(err => this.msgService.error(err.message))).subscribe((users) => {
				let csv = 'UserName;Email;PhoneNumber;OrganizationUnitNames (separated by ,);FullName\r\n';
				users.items.forEach(u => {
					csv += `${u.userName};${u.email};${u.phoneNumber};${u.organizationUnits?.map(x => x.displayName)?.join(',') || ''};${u.name || ''} ${u.surname || ''}\r\n`
				})
				const blob = new Blob([csv], { type: 'text/csv' });
				this.fileHelper.saveFile(blob, 'users.csv');
			});
	}
  
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
