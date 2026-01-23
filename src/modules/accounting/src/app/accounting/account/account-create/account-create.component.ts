import { Component, OnInit, ViewChild, effect } from "@angular/core";
import {
  AccountService,
} from '@eleon/accounting-proxy';
import {
  BillingPeriodType,
  PaymentMethod,
} from '@eleon/accounting-proxy';
import { ConfirmationService } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ActivatedRoute, Params, Router } from "@angular/router";
import {
  AccountDto,
} from '@eleon/accounting-proxy';
import { IUserService, CommonOrganizationUnitDto, CommonUserDto } from '@eleon/angular-sdk.lib';
import { AccountStatus } from '@eleon/accounting-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PAGE_CONTROLS, PageControls, contributeControls } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { BeforeDialogOpenEvent, assertAlert, viewportBreakpoints } from "@eleon/angular-sdk.lib";

import { IPermissionService, ILocalizationService, IIdentitySelectionDialogService } from '@eleon/angular-sdk.lib';
import { AccountPackagesManagementComponent } from '../account-packages-management/account-packages-management.component';
import { AccountMembersManagementComponent } from '../account-members-management/account-members-management.component';

interface AccountHeader {
  data: AccountDto;
  organizationUnitSelected: CommonOrganizationUnitDto;
  owner: CommonUserDto;
  rows: any[]; // Kept for compatibility but not used - packages managed by AccountPackagesManagementComponent
  accountValidators: {
    nameEmpty: boolean;
    contactEmailEmpty: boolean;
  };
}

@Component({
  standalone: false,
  selector: "app-account-create",
  templateUrl: "./account-create.component.html",
  styleUrls: ["./account-create.component.scss"],
})
export class AccountCreateComponent implements OnInit {
  viewportBreakpoints = viewportBreakpoints;
  loading: boolean = false;
  documentObjectType = 'Account';
  accountPackageDocType = 'AccountPackage';
  originalDraft: AccountDto;
  title: string;
  header = {} as AccountHeader;
  companyUid: string;
  localizedPaymentMethods: { method: PaymentMethod; name: string }[] = [];
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[] = [];
  isAccountManager: boolean = false;
  activeTabIndex: number = 0;
  activeOptions: { value: boolean; label: string }[] = [
    { value: true, label: this.localizationService.instant('Infrastructure::Yes') },
    { value: false, label: this.localizationService.instant('Infrastructure::No') }
  ];
  attachmentsCount!: number;

  @ViewChild('packagesComponent') packagesComponent: AccountPackagesManagementComponent;
  @ViewChild('membersComponent') membersComponent: AccountMembersManagementComponent;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.SAVE({
      action: () => this.save(),
      disabled: () => this.loading,
      loading: () => this.loading,
    }),
    {
      key: "Infrastructure::Delete",
      action: () => this.deleteAccount(),
      disabled: () => this.loading,
      show: () => true,
      loading: () => false,
      icon: "fa fa-trash",
      severity: "danger",
    },
  ]);

  constructor(
    public messageService: LocalizedMessageService,
    public route: ActivatedRoute,
    public router: Router,
    public localizationService: ILocalizationService,
    public confirmationService: ConfirmationService,
    private pageStateService: PageStateService,
    private accountService: AccountService,
    private userService: IUserService,
    private permissionService: IPermissionService,
    private identitySelectionService: IIdentitySelectionDialogService
  ) {
  }

  ngOnInit(): void {
    this.isAccountManager = this.isAccountManagerCheck();
    this.localizedBillingPeriodTypes = [
      BillingPeriodType.Month,
      BillingPeriodType.Year,
      BillingPeriodType.Weekly,
      BillingPeriodType.Quarterly,
      BillingPeriodType.None,
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::BillingPeriodType:${BillingPeriodType[value]}`
      ),
    }));
    this.resetInputs();
    this.route.params.subscribe((params: Params) => {
      if (params["id"]) {
        this.loadAccountDetails(params["id"]);
      }
    });

      this.localizedPaymentMethods = Object.keys(PaymentMethod)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        method: PaymentMethod[name as keyof typeof PaymentMethod],
        name: this.localizationService.instant(
          `Infrastructure::PaymentMethod:${name}`
        ),
      }));

  }

  async loadAccountDetails(id: string) {
    this.loading = true;
    this.accountService
      .getAccountDetailsByIdById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.resetInputs();
        })
      )
      .subscribe({
        next: async (draft) => {
          this.init(draft);
        },
      });
  }

  init(dto: AccountDto): void {
    this.originalDraft = dto;
    this.title = this.localizationService.instant("AccountingModule::Account:Details:Title");
    this.resetInputs();
  }

  resetInputs(): void {
    this.pageStateService.setNotDirty();
    this.header = {
      data: {
        ...this.originalDraft,
      },
      owner: this.originalDraft?.ownerId 
        ? { id: this.originalDraft.ownerId, name: '' } as CommonUserDto
        : { name: '' } as CommonUserDto,
      organizationUnitSelected: null,
      // userFieldValues: [],
      rows: [],
      accountValidators: {
          nameEmpty: false,
          contactEmailEmpty: false,
      },
    };

    const emptyGuid = '00000000-0000-0000-0000-000000000000';
    if (this.header.data.ownerId && this.header.data.ownerId !== emptyGuid) {
      this.userService.getById(this.header.data.ownerId).subscribe({
        next: (user) => {
          this.header.owner = user;
        }
      });
    }

  }


  resetValidators() {
    this.header.accountValidators.nameEmpty = false;
    this.header.accountValidators.contactEmailEmpty = false;
  }

  async updateAccount(
    dto: AccountDto
  ): Promise<void> {
    this.loading = true;
    const request$ =
      this.accountService.updateAccountByUpdatedAccount(dto).pipe(finalize(() => (this.loading = false)));
    await request$.toPromise();
  }

  async save(
    action: string | undefined = undefined,
    commands: any[] = []
  ): Promise<void> {
    const dto: AccountDto = this.gatherRequestData();
    if (!dto) return;

    await this.updateAccount(
      dto
    );

    this.loading = false;
    this.pageStateService.setNotDirty();
    
    this.messageService.success("AccountingModule::UpdateAccount:Success");
    
    const navParams = commands || ["reload"];
    if (action) {
      this.router.navigate(navParams, {
        queryParams: {
          action: action,
        },
      });
    } else if (navParams[0] != "reload") {
      this.router.navigate(navParams);
    } else {
      this.reload();
    }
  }

  gatherRequestData(): AccountDto {
    if (!this.validateAccount()) return undefined;

    const dto: AccountDto = {
      ...this.header.data,
      companyUid: this.header.data.companyUid,
      companyName: this.header.data.companyName,
      accountStatus: AccountStatus.Active,
      dataSourceUid: '',
      dataSourceName: '',
      ownerId: this.header.owner?.id || this.header.data.ownerId,
      organizationUnitId:
        this.header.organizationUnitSelected?.id ||
        this.header.data.organizationUnitId,
      organizationUnitName:
        this.header.organizationUnitSelected?.displayName ||
        this.header.data.organizationUnitName,
    };
    return dto;
  }




  isAccountManagerCheck(): boolean {
    let checkIfHost = this.permissionService.getGrantedPolicy(
      "VPortal.Dashboard.Host"
    );
    let checkIfAccountManager = this.permissionService.getGrantedPolicy(
      "Permission.Account.AccountManager"
    );
    return checkIfAccountManager && checkIfHost;
  }

  reload() {
    if (this.header.data.id) {
      this.loadAccountDetails(this.header.data.id);
    } else {
      const currentUrl = this.router.url;
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    }
  }

  deleteAccount() {
    this.loading = true;
    this.accountService
      .cancelAccountById(this.header.data.id)
      .subscribe((reply) => {
        this.loading = false;
        if (reply) {
          this.messageService.error(reply);
          return;
        }
        this.messageService.success("AccountingModule::Success:AccountRemoved");
        this.pageStateService.setNotDirty();
        this.router.navigate(["/account/dashboard"]);
      });
  }


  validateAccount() {
    let errors: string[] = [];

    if (!this.header.data?.name) {
      this.header.accountValidators.nameEmpty = true;
      errors.push("AccountingModule::Error:NameEmpty");
    }

     if (!this.header.data?.contactPersonEmail?.length) {
      this.header.accountValidators.contactEmailEmpty = true;
      errors.push("AccountingModule::Error:ContactPersonEmailEmpty");
    }

    if (!errors.length) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    this.activeTabIndex = 0;
    return false;
  }

  onOwnerSelected(users: CommonUserDto[]): void {
    if (users && users.length > 0) {
      const selectedUser = users[0];
      this.header.owner = selectedUser;
      this.header.data.ownerId = selectedUser.id;
      this.pageStateService.setDirty();
    }
  }

  openOwnerSelectionDialog(): void {
    this.identitySelectionService.openUserSelectionDialog({
      title: this.localizationService.instant('AccountingModule::Header:Owner'),
      permissions: [],
      selectedUsers: this.header.owner?.id ? [this.header.owner] : [],
      ignoredUsers: [],
      isMultiple: false,
      onSelect: (users) => this.onOwnerSelected(users)
    });
  }

}
