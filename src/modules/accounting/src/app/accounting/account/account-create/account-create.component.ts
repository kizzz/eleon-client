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
  AccountHeaderDto,
  MemberDto,
  MemberType,
  LinkedMemberDto,
} from '@eleon/accounting-proxy';
import { BillingInformationDto } from '@eleon/accounting-proxy';
import { CommonOrganizationUnitDto, CommonUserDto, CommonUserService } from '@eleon/tenant-management-proxy';
import {
  PackageTemplateDto,
  PackageTemplateModuleDto,
} from '@eleon/accounting-proxy';
import { Table } from "primeng/table";
import { AccountStatus } from '@eleon/accounting-proxy';
import {
  AccountPackageDto,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PAGE_CONTROLS, PageControls, contributeControls } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { BeforeDialogOpenEvent, assertAlert, generateTempGuid, viewportBreakpoints } from "@eleon/angular-sdk.lib";

import { IPermissionService, ILocalizationService, IIdentitySelectionDialogService } from '@eleon/angular-sdk.lib';

interface AccountPackageRow {
  data: AccountPackageDto;
  templateNotSelected: boolean;
  nameEmpty: boolean;
  rowUniqueId: number;
  editing: boolean;
}

interface AccountHeader {
  data: AccountDto;
  organizationUnitSelected: CommonOrganizationUnitDto;
  owner: CommonUserDto;
  nameEmpty: boolean;
  rows: AccountPackageRow[];
  billingInfoValidators: {
    companyEmpty: boolean;
    contactPersonNameEmpty: boolean;
    paymentMethodNotSelected: boolean;
    companyCIDEmpty: boolean;
    contactPersonEmailEmpty: boolean;
    contactPersonTelephoneEmpty: boolean;
    billingAddressLine1Empty: boolean;
    cityEmpty: boolean;
    countryEmpty: boolean;
    stateOrProvinceEmpty: boolean;
    postalCodeEmpty: boolean;
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
  accountPackages: AccountPackageDto[] = [];
  loading: boolean = false;
  documentObjectType = 'Account';
  accountPackageDocType = 'AccountPackage';
  originalDraft: AccountDto;
  title: string;
  isCreateAccount: boolean = false;
  header = {} as AccountHeader;
  companyUid: string;
  localizedPaymentMethods: { method: PaymentMethod; name: string }[] = [];
  packageTemplates: PackageTemplateDto[] = [];
  editingSomeRow: boolean = false;
  addingRowId: number | undefined = undefined;
  @ViewChild("accountPackagesTable") rowTableRef: Table;
  attachmentsCount!: number;
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[] = [];
  isAccountManager: boolean = false;
  activeTabIndex: number = 0;
  
  // Members properties
  members: MemberDto[] = [];
  showMemberDialog: boolean = false;
  editingMember: MemberDto | null = null;
  
  // Member selection dialog properties
  showMemberSelectionDialog: boolean = false;
  currentPackageRow: AccountPackageRow | null = null;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.SAVE({
      action: () => this.save(),
      disabled: () => this.loading,
      loading: () => this.loading,
    }),
    PAGE_CONTROLS.SEND({
      action: () => this.send(),
      disabled: () => this.loading,
      loading: () => this.loading,
      show: () => this.header.data.accountStatus === AccountStatus.New,
    }),
    {
      key: "AccountingModule::Cancel",
      action: () => this.deleteAccount(),
      disabled: () => this.loading,
      show: () => !this.isTemp(),
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
    private userService: CommonUserService,
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
    if (!this.isCreateAccount) {
      this.title = this.localizationService.instant(
        "AccountingModule::Account:EditDraftTitle"
      );
    }
    this.resetInputs();
  }

  resetInputs(): void {
    this.pageStateService.setNotDirty();
    this.header = {
      data: {
        ...this.originalDraft,
        billingInformation: {
          ...this.originalDraft?.billingInformation,
        } as BillingInformationDto,
      },
      owner: this.originalDraft?.ownerId 
        ? { id: this.originalDraft.ownerId, name: '' } as CommonUserDto
        : { name: '' } as CommonUserDto,
      organizationUnitSelected: null,
      // userFieldValues: [],
      nameEmpty: false,
      rows:
        this.originalDraft?.accountPackages?.map((i, ix) =>
          this.createRow(i, ix)
        ) || [],
      billingInfoValidators: {
        companyEmpty: false,
        contactPersonNameEmpty: false,
        paymentMethodNotSelected: false,
        companyCIDEmpty: false,
        contactPersonEmailEmpty: false,
        contactPersonTelephoneEmpty: false,
        billingAddressLine1Empty: false,
        cityEmpty: false,
        countryEmpty: false,
        stateOrProvinceEmpty: false,
        postalCodeEmpty: false,
      },
    };

    const emptyGuid = '00000000-0000-0000-0000-000000000000';
    if (this.header.data.ownerId && this.header.data.ownerId !== emptyGuid) {
      this.userService.getByIdById(this.header.data.ownerId).subscribe({
        next: (user) => {
          this.header.owner = user;
        }
      });
    }

    // Initialize members
    this.members = this.originalDraft?.members ? [...this.originalDraft.members] : [];
  }

  getBillingPeriodTypeName(type: number) {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }


  onAccountPackageChange(event: PackageTemplateDto, row: AccountPackageRow) {
    if (event) {
      row.data.name = event.packageName;
      row.data.packageTemplateEntityId = event.id;
      row.data.billingPeriodType = event.billingPeriodType;
    }
  }


  resetValidators() {
    this.header.nameEmpty = false;
  }

  resetBillingValidators() {
    this.header.billingInfoValidators.companyEmpty = false;
    this.header.billingInfoValidators.contactPersonNameEmpty = false;
    this.header.billingInfoValidators.paymentMethodNotSelected = false;
    this.header.billingInfoValidators.cityEmpty = false;
    this.header.billingInfoValidators.companyCIDEmpty = false;
    this.header.billingInfoValidators.contactPersonEmailEmpty = false;
    this.header.billingInfoValidators.contactPersonTelephoneEmpty = false;
    this.header.billingInfoValidators.billingAddressLine1Empty = false;
    this.header.billingInfoValidators.countryEmpty = false;
    this.header.billingInfoValidators.stateOrProvinceEmpty = false;
    this.header.billingInfoValidators.postalCodeEmpty = false;
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
    saveAsDraft = true,
    action: string | undefined = undefined,
    commands: any[] = []
  ): Promise<void> {
    const dto: AccountDto = this.gatherRequestData(saveAsDraft);
    if (!dto) return;

    await this.updateAccount(
      dto
    );

    this.loading = false;
    this.pageStateService.setNotDirty();
    if (this.isCreateAccount) {
      this.messageService.success("AccountingModule::CreateAccount:Success");
    } else {
      this.messageService.success("AccountingModule::UpdateAccount:Success");
    }
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

  gatherRequestData(draft: boolean): AccountDto {
    if (!this.validateAccount(draft)) return undefined;
    if (!this.validateBillingInfo(draft)) return undefined;

    const dto: AccountDto = {
      ...this.header.data,
      accountPackages: this.header.rows.map((row) => ({
        ...row.data,
      })),
      members: this.members.map((member) => ({
        ...member,
      })),
      companyUid: this.header.data.companyUid,
      companyName: this.header.data.companyName,
      accountStatus: draft ? AccountStatus.New : AccountStatus.Active,
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

  send(): void {
    this.save(false, undefined, [
      "/account/dashboard",
      this.header.data.id,
    ]);
  }

  openTrace(event: BeforeDialogOpenEvent) {
    if (this.isCreateAccount) {
      event.preventOpening();
      this.confirmationService.confirm({
        header: this.localizationService.instant("Infrastructure::Warning"),
        message: this.localizationService.instant("Lifecycle::FlowNoAddedYet"),
        accept: () => {
          this.save();
        },
        reject: () => {
          return;
        },
        acceptLabel: this.localizationService.instant(
          "Infrastructure::Yes"
        ),
        rejectLabel: this.localizationService.instant("Infrastructure::No"),
        acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
        rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
      });
      return;
    }
  }

  isInitialization(): boolean {
    return false; // Draft status no longer exists
  }

  isTemp(): boolean {
    return false; // Temp status no longer exists
  }

  generatePassword() {
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const digitChars = "0123456789";
    const specialChars = "!@#$%^&*()_+";
    let password = "";

    password += upperChars[Math.floor(Math.random() * upperChars.length)];
    password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    password += digitChars[Math.floor(Math.random() * digitChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 0; i < 2; i++) {
      const charset = upperChars + lowerChars + digitChars + specialChars;
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    // adminPassword removed from AccountDto
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

  onAttachmentsCountChange(count): void {
    this.attachmentsCount = count;
  }

  validateBillingInfo(isDraft) {
    let errors: string[] = [];

    if (
      !this.header.data.billingInformation?.companyName?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.companyEmpty = true;
      errors.push("AccountingModule::Error:CompanyEmpty");
    }

    if (!this.header.data.billingInformation?.companyCID?.length && !isDraft) {
      this.header.billingInfoValidators.companyCIDEmpty = true;
      errors.push("AccountingModule::Error:CompanyCIDEmpty");
    }

    if (
      !this.header.data.billingInformation?.contactPersonName?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.contactPersonNameEmpty = true;
      errors.push("AccountingModule::Error:ContactPersonNameEmpty");
    }

    if (
      !this.header.data.billingInformation?.contactPersonEmail?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.contactPersonEmailEmpty = true;
      errors.push("AccountingModule::Error:ContactPersonEmailEmpty");
    }

    if (
      !this.header.data.billingInformation?.contactPersonTelephone?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.contactPersonTelephoneEmpty = true;
      errors.push("AccountingModule::Error:ContactPersonTelephoneEmpty");
    }

    if (this.header.data.billingInformation?.paymentMethod < 0 && !isDraft) {
      this.header.billingInfoValidators.paymentMethodNotSelected = true;
      errors.push("AccountingModule::Error:PaymentMethodNotSelected");
    }

    if (
      !this.header.data.billingInformation?.billingAddressLine1?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.billingAddressLine1Empty = true;
      errors.push("AccountingModule::Error:BillingAddressLine1Empty");
    }

    if (!this.header.data.billingInformation?.country?.length && !isDraft) {
      this.header.billingInfoValidators.countryEmpty = true;
      errors.push("AccountingModule::Error:CountryEmpty");
    }

    if (!this.header.data.billingInformation?.city?.length && !isDraft) {
      this.header.billingInfoValidators.cityEmpty = true;
      errors.push("AccountingModule::Error:CityEmpty");
    }

    if (
      !this.header.data.billingInformation?.stateOrProvince?.length &&
      !isDraft
    ) {
      this.header.billingInfoValidators.stateOrProvinceEmpty = true;
      errors.push("AccountingModule::Error:StateOrProvinceEmpty");
    }

    if (!this.header.data.billingInformation?.postalCode?.length && !isDraft) {
      this.header.billingInfoValidators.postalCodeEmpty = true;
      errors.push("AccountingModule::Error:PostalCodeEmpty");
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    this.activeTabIndex = 1;
    return false;
  }

  validateAccount(isDraft) {
    let errors: string[] = [];

    if (!this.header.data?.accountName && !isDraft) {
      this.header.nameEmpty = true;
      errors.push("AccountingModule::Error:NameEmpty");
    }

    if (this.header?.rows?.length <= 0 && !isDraft) {
      errors.push("AccountingModule::Error:RowsEmpty");
    }

    // type validation removed - AccountDto doesn't have type property

    if (!errors.length) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    this.activeTabIndex = 0;
    return false;
  }

  createRow(item: AccountPackageDto, id: number): AccountPackageRow {
    return {
      data: item,
      rowUniqueId: id,
      editing: false,
      templateNotSelected: false,
      nameEmpty: false,
    };
  }

  getRowUniqueId(): number {
    let max = -1;
    for (const item of this.header.rows) {
      if (item.rowUniqueId > max) max = item.rowUniqueId;
    }
    return max + 1;
  }

  addRow(): void {
    if (this.editingSomeRow) {
      this.messageService.error("AccountingModule::Error:RowEditingInProcess");
      return;
    }

    this.pageStateService.setDirty();
    let newRow: AccountPackageRow = this.createRow(
      {
        id: generateTempGuid(),
        autoSuspention: false,
        status: AccountStatus.New,
        billingPeriodType: BillingPeriodType.Month,
        autoRenewal: false,
        oneTimeDiscount: 0,
        permanentDiscount: 0,
        linkedMembers: [],
      },
      this.getRowUniqueId()
    );

    this.addingRowId = newRow.rowUniqueId;
    this.header.rows.push(newRow);
    this.startRowEditing(newRow);
  }

  editRow(row: AccountPackageRow): void {
    if (this.editingSomeRow) {
      this.messageService.error("AccountingModule::Error:RowEditingInProcess");
      return;
    }
    this.startRowEditing(row);
  }

  startRowEditing(row: AccountPackageRow): void {
    this.pageStateService.setDirty();
    this.editingSomeRow = true;
    row.editing = true;
    this.rowTableRef.initRowEdit(row);
  }

  saveEditedRow(
    row: AccountPackageRow,
    element: HTMLTableRowElement
  ): void {
    this.pageStateService.setDirty();
    const valid = this.validateRow(row);
    if (!valid) return;
    row.editing = false;
    this.rowTableRef.saveRowEdit(row, element);
    if (this.addingRowId === row.rowUniqueId) {
      this.addingRowId = undefined;
    }
    this.editingSomeRow = false;
  }

  validateRow(
    row: AccountPackageRow
  ): boolean {
    let errors: string[] = [];

    if (
      !row.data.packageTemplateEntityId ||
      row.data.packageTemplateEntityId?.length <= 0
    ) {
      row.templateNotSelected = true;
      errors.push("AccountingModule::Error:PackageTemplateNotSelected");
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  cancelRowEditing(
    row: AccountPackageRow,
    rowIndex: number
  ): void {
    if (this.addingRowId === row.rowUniqueId) {
      this.addingRowId = undefined;
      this.removeRow(rowIndex);
    } else {
      const valid = this.validateRow(row);
      if (!valid) return;
      this.rowTableRef.cancelRowEdit(row);
    }
    row.editing = false;
    this.editingSomeRow = false;
  }

  removeRow(rowIndex: number): void {
    this.header.rows.splice(rowIndex, 1);
  }

  resetRowValidators(row: AccountPackageRow): void {
    row.templateNotSelected = false;
    row.nameEmpty = false;
  }

  ensureRowEditing(): void {
    const editedRow = this.header.rows.find((x) => x.editing);
    if (editedRow) {
      this.startRowEditing(editedRow);
    }
  }

  getRowsLength(): number {
    return this.header?.rows?.length || 0;
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

  // Members methods
  addMember(): void {
    this.editingMember = null;
    this.showMemberDialog = true;
  }

  editMember(member: MemberDto): void {
    this.editingMember = { ...member };
    this.showMemberDialog = true;
  }

  onMemberDialogSave(member: MemberDto): void {
    this.pageStateService.setDirty();
    
    if (this.editingMember) {
      // Editing existing member - find and update
      const memberIndex = this.members.findIndex(
        (m) => m.id === this.editingMember?.id
      );
      if (memberIndex >= 0) {
        this.members[memberIndex] = { ...member };
      }
    } else {
      // Adding new member
      this.members.push({ ...member });
    }
    
    this.editingMember = null;
    this.showMemberDialog = false;
  }

  removeMember(memberIndex: number): void {
    this.pageStateService.setDirty();
    this.members.splice(memberIndex, 1);
  }

  getMembersLength(): number {
    return this.members?.length || 0;
  }

  getMemberTypeName(type: MemberType): string {
    return this.localizationService.instant(
      `AccountingModule::MemberType:${MemberType[type]}`
    );
  }

  // Member selection dialog methods
  openMemberSelectionDialog(row: AccountPackageRow): void {
    this.currentPackageRow = row;
    this.showMemberSelectionDialog = true;
  }

  onMemberSelectionSave(selectedLinkedMembers: LinkedMemberDto[]): void {
    if (this.currentPackageRow) {
      this.pageStateService.setDirty();
      this.currentPackageRow.data.linkedMembers = selectedLinkedMembers;
      this.currentPackageRow = null;
      this.showMemberSelectionDialog = false;
    }
  }

  getLinkedMembersDisplay(row: AccountPackageRow){
    if (!row.data.linkedMembers || row.data.linkedMembers.length === 0) {
      return '-';
    }
    return row.data.linkedMembers.length;
  }
}
