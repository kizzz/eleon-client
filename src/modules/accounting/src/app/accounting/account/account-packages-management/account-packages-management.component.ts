import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import {
  AccountPackageService,
  AccountMemberService,
  AccountPackageDto,
  AccountPackageListRequestDto,
  BillingPeriodType,
  LinkedUserDto,
  LinkedTenantDto,
  CreateLinkedUserDto,
  CreateLinkedTenantDto,
  LinkedUserListRequestDto,
  LinkedTenantListRequestDto,
  PackageType,
  UserMemberDto,
  TenantMemberDto,
} from '@eleon/accounting-proxy';
import { contributeControls, LocalizedMessageService, PAGE_CONTROLS, PageControls } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
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
  showMemberSelectionDialog: boolean = false;
  availableMembers: (UserMemberDto | TenantMemberDto)[] = [];
  selectedLinkedMembers: (LinkedUserDto | LinkedTenantDto)[] = [];
  currentPackageType: PackageType | undefined = undefined;
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
    private accountMemberService: AccountMemberService
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
          this.loadLinkedMembersForAllPackages();
          this.emitPackagesChange();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadPackagesFailed");
          console.error("Error loading packages:", error);
        },
      });
  }

  loadLinkedMembersForAllPackages(): void {
    this.rows.forEach((row) => {
      if (row.data.id) {
        this.loadLinkedMembersForPackage(row);
      }
    });
  }

  loadLinkedMembersForPackage(row: AccountPackageRow): void {
    if (!row.data.id) return;

    const userRequest: LinkedUserListRequestDto = {
      accountPackageId: row.data.id,
      skipCount: 0,
      maxResultCount: 1000,
    };

    const tenantRequest: LinkedTenantListRequestDto = {
      accountPackageId: row.data.id,
      skipCount: 0,
      maxResultCount: 1000,
    };

    forkJoin({
      users: this.accountMemberService.getLinkedUsers(userRequest),
      tenants: this.accountMemberService.getLinkedTenants(tenantRequest),
    }).subscribe({
      next: (result) => {
        row.linkedMembersCount = (result.users.items?.length || 0) + (result.tenants.items?.length || 0);
      },
      error: (error) => {
        console.error("Error loading linked members:", error);
        row.linkedMembersCount = 0;
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
      totalLinkedUsers: 0,
      totalLinkedTenants: 0,
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
      this.loadLinkedMembersForPackage(existingRow);
    } else {
      // Add new row
      const newRow = this.createRow(packageDto);
      this.rows.push(newRow);
      this.loadLinkedMembersForPackage(newRow);
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
          console.error("Error deleting package:", error);
        },
      });
  }

  getBillingPeriodTypeName(type: number): string {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }

  openMemberSelectionDialog(row: AccountPackageRow): void {
    this.currentPackageRow = row;
    // Get packageType from the package template
    this.currentPackageType = row.data.packageTemplate?.packageType;
    this.loadAvailableMembers();
    this.showMemberSelectionDialog = true;
  }

  loadAvailableMembers(): void {
    if (!this.accountId) return;

    const userRequest = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    const tenantRequest = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    forkJoin({
      users: this.accountMemberService.getUserMembers(userRequest),
      tenants: this.accountMemberService.getTenantMembers(tenantRequest),
    }).subscribe({
      next: (result) => {
        // Pass UserMemberDto and TenantMemberDto directly
        const userMembers: UserMemberDto[] = result.users.items || [];
        const tenantMembers: TenantMemberDto[] = result.tenants.items || [];
        this.availableMembers = [...userMembers, ...tenantMembers];
        this.loadSelectedLinkedMembers();
      },
      error: (error) => {
        console.error("Error loading available members:", error);
        this.availableMembers = [];
      },
    });
  }

  loadSelectedLinkedMembers(): void {
    if (!this.currentPackageRow?.data.id) {
      this.selectedLinkedMembers = [];
      return;
    }

    const packageId = this.currentPackageRow.data.id;
    const userRequest: LinkedUserListRequestDto = {
      accountPackageId: packageId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    const tenantRequest: LinkedTenantListRequestDto = {
      accountPackageId: packageId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    forkJoin({
      users: this.accountMemberService.getLinkedUsers(userRequest),
      tenants: this.accountMemberService.getLinkedTenants(tenantRequest),
    }).subscribe({
      next: (result) => {
        // Pass LinkedUserDto and LinkedTenantDto directly
        const userLinked: LinkedUserDto[] = result.users.items || [];
        const tenantLinked: LinkedTenantDto[] = result.tenants.items || [];
        this.selectedLinkedMembers = [...userLinked, ...tenantLinked];
      },
      error: (error) => {
        console.error("Error loading selected linked members:", error);
        this.selectedLinkedMembers = [];
      },
    });
  }

  onMemberSelectionSave(selectedLinkedMembers: (LinkedUserDto | LinkedTenantDto)[]): void {
    if (!this.currentPackageRow || !this.currentPackageRow.data.id) return;

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    const packageId = this.currentPackageRow.data.id;

    // Load current linked members
    const userRequest: LinkedUserListRequestDto = {
      accountPackageId: packageId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    const tenantRequest: LinkedTenantListRequestDto = {
      accountPackageId: packageId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    forkJoin({
      currentUsers: this.accountMemberService.getLinkedUsers(userRequest),
      currentTenants: this.accountMemberService.getLinkedTenants(tenantRequest),
    }).subscribe({
      next: (current) => {
        const currentUserIds = new Set((current.currentUsers.items || []).map((u) => u.userMemberEntityId).filter(Boolean));
        const currentTenantIds = new Set((current.currentTenants.items || []).map((t) => t.tenantMemberEntityId).filter(Boolean));

        // Separate selected members by type
        const selectedUserIds = new Set<string>();
        const selectedTenantIds = new Set<string>();

        selectedLinkedMembers.forEach((member) => {
          if ('userMemberEntityId' in member && member.userMemberEntityId) {
            selectedUserIds.add(member.userMemberEntityId);
          } else if ('tenantMemberEntityId' in member && member.tenantMemberEntityId) {
            selectedTenantIds.add(member.tenantMemberEntityId);
          }
        });

        // Delete unlinked users
        current.currentUsers.items?.forEach((linkedUser) => {
          if (linkedUser.id && linkedUser.userMemberEntityId && !selectedUserIds.has(linkedUser.userMemberEntityId)) {
            this.accountMemberService.deleteLinkedUser(linkedUser.id).subscribe({
              error: (error) => console.error("Error deleting linked user:", error),
            });
          }
        });

        // Delete unlinked tenants
        current.currentTenants.items?.forEach((linkedTenant) => {
          if (linkedTenant.id && linkedTenant.tenantMemberEntityId && !selectedTenantIds.has(linkedTenant.tenantMemberEntityId)) {
            this.accountMemberService.deleteLinkedTenant(linkedTenant.id).subscribe({
              error: (error) => console.error("Error deleting linked tenant:", error),
            });
          }
        });

        // Add new linked users
        selectedUserIds.forEach((userMemberId) => {
          if (!currentUserIds.has(userMemberId)) {
            const createDto: CreateLinkedUserDto = { userMemberEntityId: userMemberId };
            this.accountMemberService.addLinkedUser(packageId, createDto).subscribe({
              next: () => {
                this.loadLinkedMembersForPackage(this.currentPackageRow!);
              },
              error: (error) => console.error("Error adding linked user:", error),
            });
          }
        });

        // Add new linked tenants
        selectedTenantIds.forEach((tenantMemberId) => {
          if (!currentTenantIds.has(tenantMemberId)) {
            const createDto: CreateLinkedTenantDto = { tenantMemberEntityId: tenantMemberId };
            this.accountMemberService.addLinkedTenant(packageId, createDto).subscribe({
              next: () => {
                this.loadLinkedMembersForPackage(this.currentPackageRow!);
              },
              error: (error) => console.error("Error adding linked tenant:", error),
            });
          }
        });

        this.currentPackageRow = null;
        this.showMemberSelectionDialog = false;
      },
      error: (error) => {
        console.error("Error loading current linked members:", error);
        this.currentPackageRow = null;
        this.showMemberSelectionDialog = false;
      },
    });
  }

  getLinkedMembersDisplay(row: AccountPackageRow): string {
    if (!row.linkedMembersCount || row.linkedMembersCount === 0) {
      return '-';
    }
    if (row.data.packageTemplate?.packageType === PackageType.User) {
      return `${row.totalLinkedUsers?.toString() || '0'}/${row.data.packageTemplate?.maxMembers || '∞'}`;
    }
    if (row.data.packageTemplate?.packageType === PackageType.Tenant) {
      return `${row.totalLinkedTenants?.toString() || '0'}/${row.data.packageTemplate?.maxMembers || '∞'}`;
    }
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
          console.error("Error loading linked users:", error);
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
          console.error("Error loading linked tenants:", error);
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
          this.loadLinkedMembersForPackage(row);
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
          console.error("Error deleting linked user:", error);
        },
      });
  }

  deleteLinkedTenant(linkedTenant: LinkedTenantDto, row: AccountPackageRow): void {
    if (!linkedTenant.id) {
      this.messageService.error("AccountingModule::Error:LinkedTenantIdRequired");
      return;
    }

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
          this.loadLinkedMembersForPackage(row);
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
          console.error("Error deleting linked tenant:", error);
        },
      });
  }

  private emitPackagesChange(): void {
    const packages = this.rows.map((row) => row.data);
    this.packagesChange.emit(packages);
  }
}
