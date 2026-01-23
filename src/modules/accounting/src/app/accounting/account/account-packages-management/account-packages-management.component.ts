import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, SimpleChanges } from "@angular/core";
import {
  AccountPackageService,
  AccountMemberService,
  AccountPackageDto,
  CreateAccountPackageDto,
  AccountPackageListRequestDto,
  BillingPeriodType,
  AccountStatus,
  PackageTemplateDto,
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
import { Table } from "primeng/table";
import { contributeControls, LocalizedMessageService, PAGE_CONTROLS, PageControls } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { generateTempGuid, viewportBreakpoints } from "@eleon/angular-sdk.lib";
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { finalize, forkJoin } from "rxjs";

interface AccountPackageRow {
  data: AccountPackageDto;
  templateNotSelected: boolean;
  editing: boolean;
  linkedMembersCount?: number;
  rowId?: string; // Unique identifier for table row editing
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

  @ViewChild("accountPackagesTable") rowTableRef: Table;

  viewportBreakpoints = viewportBreakpoints;
  rows: AccountPackageRow[] = [];
  loading: boolean = false;
  editingSomeRow: boolean = false;
  addingRowId: string | undefined = undefined;
  currentPackageRow: AccountPackageRow | null = null;
  showMemberSelectionDialog: boolean = false;
  availableMembers: (UserMemberDto | TenantMemberDto)[] = [];
  selectedLinkedMembers: (LinkedUserDto | LinkedTenantDto)[] = [];
  currentPackageType: PackageType | undefined = undefined;

  @PageControls()
    controls = contributeControls([
      PAGE_CONTROLS.ADD({
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
      editing: false,
      templateNotSelected: false,
      linkedMembersCount: 0,
      rowId: item.id || `temp-${Date.now()}-${Math.random()}`,
    };
  }

  addRow(): void {
    if (this.editingSomeRow) {
      this.messageService.error("AccountingModule::Error:RowEditingInProcess");
      return;
    }

    if (!this.accountId) {
      this.messageService.error("AccountingModule::Error:AccountIdRequired");
      return;
    }

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    const newPackage: CreateAccountPackageDto = {
      autoSuspention: false,
      billingPeriodType: BillingPeriodType.Month,
      autoRenewal: false,
      oneTimeDiscount: 0,
      permanentDiscount: 0,
    };

    this.loading = true;
    this.accountPackageService
      .addAccountPackage(this.accountId, newPackage)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (createdPackage) => {
          const newRow = this.createRow(createdPackage);
          this.addingRowId = createdPackage.id;
          this.rows.push(newRow);
          this.startRowEditing(newRow);
          this.emitPackagesChange();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddPackageFailed");
          console.error("Error adding package:", error);
        },
      });
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
    this.dirtyChange.emit();
    this.editingSomeRow = true;
    row.editing = true;
    this.rowTableRef.initRowEdit(row);
  }

  saveEditedRow(row: AccountPackageRow, element: HTMLTableRowElement): void {
    const valid = this.validateRow(row);
    if (!valid) return;

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    this.loading = true;
    this.accountPackageService
      .updateAccountPackage(row.data)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (updatedPackage) => {
          row.data = updatedPackage;
          row.editing = false;
          this.rowTableRef.saveRowEdit(row, element);
          if (this.addingRowId === row.data.id) {
            this.addingRowId = undefined;
          }
          this.editingSomeRow = false;
          this.emitPackagesChange();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:UpdatePackageFailed");
          console.error("Error updating package:", error);
        },
      });
  }

  validateRow(row: AccountPackageRow): boolean {
    let errors: string[] = [];

    if (!row.data.packageTemplateEntityId || row.data.packageTemplateEntityId?.length <= 0) {
      row.templateNotSelected = true;
      errors.push("AccountingModule::Error:PackageTemplateNotSelected");
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  cancelRowEditing(row: AccountPackageRow, rowIndex: number): void {
    if (this.addingRowId === row.data.id) {
      this.addingRowId = undefined;
      this.removeRow(rowIndex);
    } else {
      this.loading = true;
      this.accountPackageService
        .getAccountPackage(row.data.id!)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (originalPackage) => {
            row.data = originalPackage;
            this.rowTableRef.cancelRowEdit(row);
            row.editing = false;
            this.editingSomeRow = false;
          },
          error: (error) => {
            console.error("Error loading original package:", error);
            this.rowTableRef.cancelRowEdit(row);
            row.editing = false;
            this.editingSomeRow = false;
          },
        });
    }
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

  resetRowValidators(row: AccountPackageRow): void {
    row.templateNotSelected = false;
  }

  ensureRowEditing(): void {
    const editedRow = this.rows.find((x) => x.editing);
    if (editedRow) {
      this.startRowEditing(editedRow);
    }
  }

  getRowsLength(): number {
    return this.rows?.length || 0;
  }

  getBillingPeriodTypeName(type: number): string {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }

  onAccountPackageChange(event: PackageTemplateDto, row: AccountPackageRow): void {
    if (event) {
      row.data.name = event.packageName;
      row.data.packageTemplateEntityId = event.id;
      row.data.billingPeriodType = event.billingPeriodType;
      // Store package template for later use (includes packageType)
      row.data.packageTemplate = event;
    }
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
    return row.linkedMembersCount.toString();
  }

  private emitPackagesChange(): void {
    const packages = this.rows.map((row) => row.data);
    this.packagesChange.emit(packages);
  }
}
