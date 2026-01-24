import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import {
  AccountPackageService,
  AccountMemberService,
  AccountPackageDto,
  AccountPackageListRequestDto,
  BillingPeriodType,
  LinkedUserDto,
  LinkedTenantDto,
  LinkedUserListRequestDto,
  LinkedTenantListRequestDto,
  PackageType,
} from '@eleon/accounting-proxy';
import { contributeControls, LocalizedMessageService, PAGE_CONTROLS, PageControls } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { finalize, forkJoin } from "rxjs";
import { LazyLoadEvent } from 'primeng/api';

interface AccountPackageRow {
  data: AccountPackageDto;
  templateNotSelected: boolean;
  linkedMembersCount?: number;
  rowId?: string;
  linkedUsers?: LinkedUserDto[];
  linkedTenants?: LinkedTenantDto[];
  loadingLinkedUsers?: boolean;
  loadingLinkedTenants?: boolean;
  totalLinkedUsers?: number;
  totalLinkedTenants?: number;
}

@Component({
  standalone: false,
  selector: "app-account-packages-management",
  templateUrl: "./account-packages-management.component.html",
  styleUrls: ["./account-packages-management.component.scss"],
})
export class AccountPackagesManagementComponent implements OnInit, OnChanges {
  @Input() accountId: string;
  @Input() isAccountManager: boolean = false;
  @Input() localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[] = [];

  @Output() packagesChange = new EventEmitter<AccountPackageDto[]>();
  @Output() dirtyChange = new EventEmitter<void>();

  viewportBreakpoints = viewportBreakpoints;
  rows: AccountPackageRow[] = [];
  loading: boolean = false;
  currentPackageRow: AccountPackageRow | null = null;
  showUserMemberSelectionDialog: boolean = false;
  showTenantMemberSelectionDialog: boolean = false;
  showCreateDialog: boolean = false;
  currentEditingPackageId: string | undefined = undefined;
  PackageType = PackageType;

  @PageControls()
    controls = contributeControls([
      PAGE_CONTROLS.ADD({
        key: "AccountingModule::AddPackage",
        action: () => this.addRow(),
        disabled: () => this.loading,
        loading: () => this.loading,
      }),
    ]);

  constructor(
    public messageService: LocalizedMessageService,
    public localizationService: ILocalizationService,
    private pageStateService: PageStateService,
    private accountPackageService: AccountPackageService,
    private accountMemberService: AccountMemberService,
    private localizedConfirmationService: LocalizedConfirmationService
  ) {}

  ngOnInit(): void {
    if (this.accountId) {
      this.loadPackages();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountId'] && !changes['accountId'].firstChange && this.accountId) {
      this.loadPackages();
    }
  }

  loadPackages(): void {
    if (!this.accountId) return;

    this.loading = true;
    const request: AccountPackageListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    this.accountPackageService
      .getAccountPackages(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.rows = (result.items || []).map((pkg) => this.createRow(pkg));
          this.emitPackagesChange();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadPackagesFailed");
        },
      });
  }

  createRow(item: AccountPackageDto): AccountPackageRow {
    return {
      data: item,
      templateNotSelected: false,
      linkedMembersCount: 0,
      rowId: item.id || `temp-${Date.now()}-${Math.random()}`,
      linkedUsers: [],
      linkedTenants: [],
      loadingLinkedUsers: false,
      loadingLinkedTenants: false,
      totalLinkedUsers: null,
      totalLinkedTenants: null,
    };
  }

  addRow(): void {
    if (!this.accountId) {
      this.messageService.error("AccountingModule::Error:AccountIdRequired");
      return;
    }

    this.currentEditingPackageId = undefined;
    this.showCreateDialog = true;
  }

  editRow(row: AccountPackageRow): void {
    if (!row.data.id) {
      this.messageService.error("AccountingModule::Error:PackageIdRequired");
      return;
    }

    this.currentEditingPackageId = row.data.id;
    this.showCreateDialog = true;
  }

  onAccountPackageSaved(packageDto: AccountPackageDto): void {
    const existingRowIndex = this.rows.findIndex((r) => r.data.id === packageDto.id);

    if (existingRowIndex >= 0) {
      // Update existing row
      const existingRow = this.rows[existingRowIndex];
      existingRow.data = packageDto;
      // this.loadLinkedMembersForPackage(existingRow);
    } else {
      // Add new row
      const newRow = this.createRow(packageDto);
      this.rows.push(newRow);
      // this.loadLinkedMembersForPackage(newRow);
    }

    this.pageStateService.setDirty();
    this.dirtyChange.emit();
    this.emitPackagesChange();
  }

  removeRow(rowIndex: number): void {
    const row = this.rows[rowIndex];
    if (!row.data.id) {
      this.rows.splice(rowIndex, 1);
      this.emitPackagesChange();
      return;
    }

    this.localizedConfirmationService.confirm('AccountingModule::Confirm:DeletePackage', () => {
      this.loading = true;
      this.accountPackageService
        .deleteAccountPackage(row.data.id)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: () => {
            this.pageStateService.setDirty();
            this.dirtyChange.emit();
            this.rows.splice(rowIndex, 1);
            this.emitPackagesChange();
          },
          error: (error) => {
            this.messageService.error("AccountingModule::Error:DeletePackageFailed");
          },
        });
    });
  }

  getBillingPeriodTypeName(type: number): string {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }

  openMemberSelectionDialog(row: AccountPackageRow): void {
    if (!row.data.id) {
      this.messageService.error("AccountingModule::Error:PackageIdRequired");
      return;
    }

    this.currentPackageRow = row;
    const packageType = row.data.packageTemplate?.packageType;

    if (packageType === PackageType.User) {
      this.showUserMemberSelectionDialog = true;
    } else if (packageType === PackageType.Tenant) {
      this.showTenantMemberSelectionDialog = true;
    } else {
      this.messageService.error("AccountingModule::Error:InvalidPackageType");
    }
  }

  onUserAdded(linkedUser: LinkedUserDto): void {
    if (this.currentPackageRow) {
      this.pageStateService.setDirty();
      this.dirtyChange.emit();
      // Reload linked users for the current package row
      const event: LazyLoadEvent = {
        first: 0,
        rows: 10,
      };
      this.loadLinkedUsers(event, this.currentPackageRow);
    }
    this.currentPackageRow = null;
  }

  onTenantAdded(linkedTenant: LinkedTenantDto): void {
    if (this.currentPackageRow) {
      this.pageStateService.setDirty();
      this.dirtyChange.emit();
      // Reload linked tenants for the current package row
      const event: LazyLoadEvent = {
        first: 0,
        rows: 10,
      };
      this.loadLinkedTenants(event, this.currentPackageRow);
    }
    this.currentPackageRow = null;
  }

  getLinkedMembersDisplay(row: AccountPackageRow): string {
    return `${row.data.totalLinkedMembers?.toString() || '0'}/${row.data.packageTemplate?.maxMembers || '∞'}`;
  }

  loadLinkedUsers(event: LazyLoadEvent, row: AccountPackageRow): void {
    if (!row.data.id) return;

    row.loadingLinkedUsers = true;
    const request: LinkedUserListRequestDto = {
      accountPackageId: row.data.id,
      skipCount: event.first || 0,
      maxResultCount: event.rows || 10,
    };

    this.accountMemberService
      .getLinkedUsers(request)
      .pipe(
        finalize(() => {
          row.loadingLinkedUsers = false;
        })
      )
      .subscribe({
        next: (result) => {
          row.linkedUsers = result.items || [];
          row.totalLinkedUsers = result.totalCount || 0;
        },
        error: (error) => {
          row.linkedUsers = [];
          row.totalLinkedUsers = 0;
        },
      });
  }

  loadLinkedTenants(event: LazyLoadEvent, row: AccountPackageRow): void {
    if (!row.data.id) return;

    row.loadingLinkedTenants = true;
    const request: LinkedTenantListRequestDto = {
      accountPackageId: row.data.id,
      skipCount: event.first || 0,
      maxResultCount: event.rows || 10,
    };

    this.accountMemberService
      .getLinkedTenants(request)
      .pipe(
        finalize(() => {
          row.loadingLinkedTenants = false;
        })
      )
      .subscribe({
        next: (result) => {
          row.linkedTenants = result.items || [];
          row.totalLinkedTenants = result.totalCount || 0;
        },
        error: (error) => {
          row.linkedTenants = [];
          row.totalLinkedTenants = 0;
        },
      });
  }

  deleteLinkedUser(linkedUser: LinkedUserDto, row: AccountPackageRow): void {
    if (!linkedUser.id) {
      this.messageService.error("AccountingModule::Error:LinkedUserIdRequired");
      return;
    }

    this.localizedConfirmationService.confirm('AccountingModule::Confirm:DeleteLinkedUser', () => {
      this.accountMemberService
        .deleteLinkedUser(linkedUser.id)
        .pipe(
          finalize(() => {
            // Reload the linked users after deletion
            // Calculate current page based on total records
            const currentPage = row.totalLinkedUsers ? Math.floor((row.totalLinkedUsers - 1) / 10) : 0;
            const event: LazyLoadEvent = {
              first: currentPage * 10,
              rows: 10,
            };
            this.loadLinkedUsers(event, row);
          })
        )
        .subscribe({
          next: () => {
            this.pageStateService.setDirty();
            this.dirtyChange.emit();
            this.messageService.success("AccountingModule::Success:LinkedUserDeleted");
          },
          error: (error) => {
            this.messageService.error("AccountingModule::Error:DeleteLinkedUserFailed");
          },
        });
    });
  }

  deleteLinkedTenant(linkedTenant: LinkedTenantDto, row: AccountPackageRow): void {
    if (!linkedTenant.id) {
      this.messageService.error("AccountingModule::Error:LinkedTenantIdRequired");
      return;
    }

    this.localizedConfirmationService.confirm('AccountingModule::Confirm:DeleteLinkedTenant', () => {
      this.accountMemberService
        .deleteLinkedTenant(linkedTenant.id)
        .pipe(
          finalize(() => {
            // Reload the linked tenants after deletion
            // Calculate current page based on total records
            const currentPage = row.totalLinkedTenants ? Math.floor((row.totalLinkedTenants - 1) / 10) : 0;
            const event: LazyLoadEvent = {
              first: currentPage * 10,
              rows: 10,
            };
            this.loadLinkedTenants(event, row);
          })
        )
        .subscribe({
          next: () => {
            this.pageStateService.setDirty();
            this.dirtyChange.emit();
            this.messageService.success("AccountingModule::Success:LinkedTenantDeleted");
          },
          error: (error) => {
            this.messageService.error("AccountingModule::Error:DeleteLinkedTenantFailed");
          },
        });
    });
  }

  private emitPackagesChange(): void {
    const packages = this.rows.map((row) => row.data);
    this.packagesChange.emit(packages);
  }
}
