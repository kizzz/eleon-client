import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import {
  AccountMemberService,
  AccountPackageService,
  TenantMemberDto,
  CreateTenantMemberDto,
  TenantMemberListRequestDto,
  AccountPackageDto,
  BillingPeriodType,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { finalize } from "rxjs";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";

interface TenantMemberDisplayItem {
  id?: string;
  refTenantId?: string;
  tenantMember?: TenantMemberDto;
  packages?: AccountPackageDto[];
  loadingPackages?: boolean;
}

@Component({
  standalone: false,
  selector: "app-account-tenant-management",
  templateUrl: "./account-tenant-management.component.html",
  styleUrls: ["./account-tenant-management.component.scss"],
})
export class AccountTenantManagementComponent implements OnInit, OnChanges {
  @Input() accountId: string;
  @Input() loading: boolean = false;

  @Output() dirtyChange = new EventEmitter<void>();

  viewportBreakpoints = viewportBreakpoints;
  members: TenantMemberDisplayItem[] = [];
  showMemberDialog: boolean = false;
  componentLoading: boolean = false;

  constructor(
    public messageService: LocalizedMessageService,
    public localizationService: ILocalizationService,
    private pageStateService: PageStateService,
    private accountMemberService: AccountMemberService,
    private accountPackageService: AccountPackageService
  ) {}

  ngOnInit(): void {
    if (this.accountId) {
      this.loadMembers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountId'] && !changes['accountId'].firstChange && this.accountId) {
      this.loadMembers();
    }
  }

  loadMembers(): void {
    if (!this.accountId) return;

    this.componentLoading = true;
    const tenantRequest: TenantMemberListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    this.accountMemberService
      .getTenantMembers(tenantRequest)
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.members = (result.items || []).map((t) => ({
            id: t.id,
            refTenantId: t.refTenantId,
            tenantMember: t,
            loadingPackages: false,
          }));
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadMembersFailed");
          console.error("Error loading tenant members:", error);
        },
      });
  }

  addMember(): void {
    this.showMemberDialog = true;
  }

  onMemberDialogSave(memberData: { refTenantId: string }): void {
    if (!this.accountId) return;

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    // Add new member
    this.addTenantMember(memberData.refTenantId);

    this.showMemberDialog = false;
  }

  addTenantMember(refTenantId: string): void {
    if (!this.accountId) return;

    this.componentLoading = true;
    const createDto: CreateTenantMemberDto = { refTenantId };
    this.accountMemberService
      .addTenantMember(this.accountId, createDto)
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: (createdMember) => {
          const newItem: TenantMemberDisplayItem = {
            id: createdMember.id,
            refTenantId: createdMember.refTenantId,
            tenantMember: createdMember,
            loadingPackages: false,
          };
          this.members.push(newItem);
          this.messageService.success("AccountingModule::Success:MemberAdded");
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddMemberFailed");
          console.error("Error adding tenant member:", error);
        },
      });
  }

  removeMember(memberIndex: number): void {
    const member = this.members[memberIndex];
    if (!member) return;

    this.deleteMemberInternal(member, () => {
      this.members.splice(memberIndex, 1);
    });
  }

  private deleteMemberInternal(member: TenantMemberDisplayItem, onSuccess: () => void): void {
    if (!member.id) {
      onSuccess();
      return;
    }

    this.componentLoading = true;
    this.accountMemberService
      .deleteTenantMember(member.id)
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.pageStateService.setDirty();
          this.dirtyChange.emit();
          onSuccess();
          this.messageService.success("AccountingModule::Success:MemberRemoved");
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:DeleteMemberFailed");
          console.error("Error deleting tenant member:", error);
        },
      });
  }

  getMemberRefTenantId(member: TenantMemberDisplayItem): string {
    return member.tenantMember?.name || '-';
  }

  loadPackagesForMember(member: TenantMemberDisplayItem): void {
    if (!member.id) {
      return;
    }

    // Don't reload if already loaded or currently loading
    if (member.loadingPackages || (member.packages !== undefined && member.packages !== null)) {
      return;
    }

    member.loadingPackages = true;
    this.accountPackageService
      .getListByMemberIdByMemberId(member.id)
      .pipe(
        finalize(() => {
          member.loadingPackages = false;
        })
      )
      .subscribe({
        next: (packages) => {
          member.packages = packages || [];
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadPackagesFailed");
          console.error("Error loading packages for member:", error);
          member.packages = [];
        },
      });
  }

  onRowExpand(event: any): void {
    const member = event.data as TenantMemberDisplayItem;
    this.loadPackagesForMember(member);
  }

  getBillingPeriodTypeName(type: number): string {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }
}
