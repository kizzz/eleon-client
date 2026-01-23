import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import {
  AccountMemberService,
  UserMemberDto,
  CreateUserMemberDto,
  UserMemberListRequestDto,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { finalize } from "rxjs";
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";

interface UserMemberDisplayItem {
  id?: string;
  userId?: string;
  userMember?: UserMemberDto;
}

@Component({
  standalone: false,
  selector: "app-account-user-management",
  templateUrl: "./account-user-management.component.html",
  styleUrls: ["./account-user-management.component.scss"],
})
export class AccountUserManagementComponent implements OnInit, OnChanges {
  @Input() accountId: string;
  @Input() loading: boolean = false;

  @Output() dirtyChange = new EventEmitter<void>();

  viewportBreakpoints = viewportBreakpoints;
  members: UserMemberDisplayItem[] = [];
  showMemberDialog: boolean = false;
  componentLoading: boolean = false;

  constructor(
    public messageService: LocalizedMessageService,
    public localizationService: ILocalizationService,
    private pageStateService: PageStateService,
    private accountMemberService: AccountMemberService
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

    this.accountMemberService
      .getUserMembers(userRequest)
      .pipe(
        finalize(() => {
          this.componentLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.members = (result.items || []).map((u) => ({
            id: u.id,
            userId: u.userId,
            userMember: u,
          }));
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadMembersFailed");
          console.error("Error loading user members:", error);
        },
      });
  }

  addMember(): void {
    this.showMemberDialog = true;
  }

  onMemberDialogSave(memberData: { userId: string }): void {
    if (!this.accountId) return;

    this.pageStateService.setDirty();
    this.dirtyChange.emit();

    // Add new member
    this.addUserMember(memberData.userId);

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
          const newItem: UserMemberDisplayItem = {
            id: createdMember.id,
            userId: createdMember.userId,
            userMember: createdMember,
          };
          this.members.push(newItem);
          this.messageService.success("AccountingModule::Success:MemberAdded");
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddMemberFailed");
          console.error("Error adding user member:", error);
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

  private deleteMemberInternal(member: UserMemberDisplayItem, onSuccess: () => void): void {
    if (!member.id) {
      onSuccess();
      return;
    }

    this.componentLoading = true;
    this.accountMemberService
      .deleteUserMember(member.id)
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
          console.error("Error deleting user member:", error);
        },
      });
  }

  getMemberUserId(member: UserMemberDisplayItem): string {
    return member.userMember?.name || '-';
  }
}
