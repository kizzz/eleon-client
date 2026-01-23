import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import {
  AccountMemberService,
  UserMemberDto,
  TenantMemberDto,
  CreateUserMemberDto,
  CreateTenantMemberDto,
  UserMemberListRequestDto,
  TenantMemberListRequestDto,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { ILocalizationService, IIdentitySelectionDialogService, CommonUserDto, CommonTenantDto } from '@eleon/angular-sdk.lib';
import { finalize, forkJoin } from "rxjs";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";

interface MemberDisplayItem {
  id?: string;
  type: 'user' | 'tenant';
  refId?: string;
  userMember?: UserMemberDto;
  tenantMember?: TenantMemberDto;
}

@Component({
  standalone: false,
  selector: "app-account-members-management",
  templateUrl: "./account-members-management.component.html",
  styleUrls: ["./account-members-management.component.scss"],
})
export class AccountMembersManagementComponent implements OnInit, OnChanges {
  @Input() accountId: string;
  @Input() loading: boolean = false;

  @Output() membersChange = new EventEmitter<(UserMemberDto | TenantMemberDto)[]>();
  @Output() dirtyChange = new EventEmitter<void>();

  viewportBreakpoints = viewportBreakpoints;
  members: MemberDisplayItem[] = [];
  showMemberDialog: boolean = false;
  editingMember: MemberDisplayItem | null = null;
  componentLoading: boolean = false;

  constructor(
    public messageService: LocalizedMessageService,
    public localizationService: ILocalizationService,
    private pageStateService: PageStateService,
    private accountMemberService: AccountMemberService,
    private identitySelectionService: IIdentitySelectionDialogService
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
    const userRequest: UserMemberListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    const tenantRequest: TenantMemberListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    forkJoin({
      users: this.accountMemberService.getUserMembers(userRequest),
      tenants: this.accountMemberService.getTenantMembers(tenantRequest),
    })
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          const userMembers: MemberDisplayItem[] = (result.users.items || []).map((u) => ({
            id: u.id,
            type: 'user' as const,
            refId: u.userId,
            userMember: u,
          }));

          const tenantMembers: MemberDisplayItem[] = (result.tenants.items || []).map((t) => ({
            id: t.id,
            type: 'tenant' as const,
            refId: t.refTenantId,
            tenantMember: t,
          }));

          this.members = [...userMembers, ...tenantMembers];
          this.emitMembersChange();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadMembersFailed");
          console.error("Error loading members:", error);
        },
      });
  }

  addMember(): void {
    this.editingMember = null;
    this.showMemberDialog = true;
  }

  editMember(member: MemberDisplayItem): void {
    this.editingMember = { ...member };
    this.showMemberDialog = true;
  }

  onMemberDialogSave(memberData: { type: 'user' | 'tenant'; userId?: string; refTenantId?: string }): void {
    if (!this.accountId) return;

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    if (this.editingMember) {
      // Update existing member
      if (memberData.type === 'user' && this.editingMember.userMember) {
        // User members can't be updated via API, only deleted and re-added
        // For now, we'll delete and re-add
        this.deleteMemberInternal(this.editingMember, () => {
          this.addUserMember(memberData.userId!);
        });
      } else if (memberData.type === 'tenant' && this.editingMember.tenantMember) {
        // Tenant members can't be updated via API, only deleted and re-added
        this.deleteMemberInternal(this.editingMember, () => {
          this.addTenantMember(memberData.refTenantId!);
        });
      }
    } else {
      // Add new member
      if (memberData.type === 'user' && memberData.userId) {
        this.addUserMember(memberData.userId);
      } else if (memberData.type === 'tenant' && memberData.refTenantId) {
        this.addTenantMember(memberData.refTenantId);
      }
    }

    this.editingMember = null;
    this.showMemberDialog = false;
  }

  addUserMember(userId: string): void {
    if (!this.accountId) return;

    this.componentLoading = true;
    const createDto: CreateUserMemberDto = { userId };
    this.accountMemberService
      .addUserMember(this.accountId, createDto)
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: (createdMember) => {
          const newItem: MemberDisplayItem = {
            id: createdMember.id,
            type: 'user',
            refId: createdMember.userId,
            userMember: createdMember,
          };
          this.members.push(newItem);
          this.emitMembersChange();
          this.messageService.success("AccountingModule::Success:MemberAdded");
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddMemberFailed");
          console.error("Error adding user member:", error);
        },
      });
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
          const newItem: MemberDisplayItem = {
            id: createdMember.id,
            type: 'tenant',
            refId: createdMember.refTenantId,
            tenantMember: createdMember,
          };
          this.members.push(newItem);
          this.emitMembersChange();
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
      this.emitMembersChange();
    });
  }

  private deleteMemberInternal(member: MemberDisplayItem, onSuccess: () => void): void {
    if (!member.id) {
      onSuccess();
      return;
    }

    this.componentLoading = true;
    const deleteObservable =
      member.type === 'user'
        ? this.accountMemberService.deleteUserMember(member.id)
        : this.accountMemberService.deleteTenantMember(member.id);

    deleteObservable
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
          console.error("Error deleting member:", error);
        },
      });
  }

  getMembersLength(): number {
    return this.members?.length || 0;
  }

  getMemberTypeName(member: MemberDisplayItem): string {
    const typeKey = member.type === 'user' ? 'User' : 'Tenant';
    return this.localizationService.instant(`AccountingModule::MemberType:${typeKey}`);
  }

  getMemberRefId(member: MemberDisplayItem): string {
    return member.refId || '-';
  }

  private emitMembersChange(): void {
    const allMembers: (UserMemberDto | TenantMemberDto)[] = this.members
      .map((m) => m.userMember || m.tenantMember)
      .filter((m): m is UserMemberDto | TenantMemberDto => !!m);
    this.membersChange.emit(allMembers);
  }
}
