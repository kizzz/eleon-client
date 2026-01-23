import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { 
  UserMemberDto,
  LinkedUserDto,
  UserMemberListRequestDto,
  AccountMemberService,
} from '@eleon/accounting-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';

interface UserTableRow {
  data: UserMemberDto;
}

@Component({
  standalone: false,
  selector: 'app-user-member-selection-dialog',
  templateUrl: './user-member-selection-dialog.component.html',
  styleUrls: ['./user-member-selection-dialog.component.scss']
})
export class UserMemberSelectionDialogComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  accountId: string;

  @Input()
  accountPackageId: string;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  userAdded = new EventEmitter<LinkedUserDto>();

  rows: UserTableRow[] = [];
  selectedRow: UserTableRow | null = null;
  viewportBreakpoints = viewportBreakpoints;
  title: string;
  loading: boolean = false;
  saving: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    private messageService: LocalizedMessageService,
    private accountMemberService: AccountMemberService
  ) {}

  ngOnInit(): void {
    this.title = this.localizationService.instant('AccountingModule::UserMemberSelection');
    if (this.display && this.accountId) {
      this.loadUserMembers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display'] && this.display && this.accountId) {
      this.loadUserMembers();
      this.selectedRow = null;
    }
  }

  loadUserMembers(): void {
    if (!this.accountId) return;

    this.loading = true;
    const request: UserMemberListRequestDto = {
      accountId: this.accountId,
      skipCount: 0,
      maxResultCount: 1000,
    };

    this.accountMemberService
      .getUserMembers(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          const userMembers: UserMemberDto[] = result.items || [];
          this.rows = userMembers.map(m => ({ data: m }));
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:LoadUserMembersFailed");
          this.rows = [];
        },
      });
  }

  onDialogShow(): void {
    if (this.accountId) {
      this.loadUserMembers();
      this.selectedRow = null;
    }
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  onSelect(): void {
    if (!this.accountPackageId) {
      this.messageService.error("AccountingModule::Error:AccountPackageIdRequired");
      return;
    }

    if (!this.selectedRow || !this.selectedRow.data.id) {
      this.messageService.warn("AccountingModule::Warning:NoUserSelected");
      return;
    }

    this.saving = true;
    const createDto = { userMemberEntityId: this.selectedRow.data.id };

    this.accountMemberService
      .addLinkedUser(this.accountPackageId, createDto)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.messageService.success("AccountingModule::Success:LinkedUserAdded");
          this.userAdded.emit(result);
          this.onDialogHide();
        },
        error: (error) => {
          this.messageService.error("AccountingModule::Error:AddLinkedUserFailed");
        },
      });
  }

  cancel(): void {
    this.onDialogHide();
  }
}
