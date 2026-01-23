import { ILocalizationService, IIdentitySelectionDialogService, CommonUserDto } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';

export interface UserMemberDisplayItem {
  id?: string;
  userId?: string;
}

@Component({
  standalone: false,
  selector: 'app-user-member-create',
  templateUrl: './user-member-create.component.html',
  styleUrls: ['./user-member-create.component.scss']
})
export class UserMemberCreateComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  memberData: UserMemberDisplayItem | null = null;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  saveEvent = new EventEmitter<{ userId: string }>();

  userId: string = '';
  userIdEmpty: boolean = false;
  loading: boolean = false;

  selectedUser: CommonUserDto | null = null;
  selectedEntityName: string = '';

  constructor(
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private pageStateService: PageStateService,
    private identitySelectionService: IIdentitySelectionDialogService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(): void {
    // Changes will be handled in onDialogShow when dialog becomes visible
  }

  onDialogShow(): void {
    if (this.memberData) {
      // Editing existing member
      this.userId = this.memberData.userId || '';
      // Set selectedEntityName to userId if we don't have the entity details
      this.selectedEntityName = this.memberData.userId || '';
    } else {
      // Creating new member
      this.userId = '';
    }
    this.userIdEmpty = false;
    this.selectedUser = null;
    if (!this.selectedEntityName) {
      this.selectedEntityName = '';
    }
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  save(): void {
    const valid = this.validate();
    if (!valid) return;

    this.pageStateService.setDirty();
    const saveData: { userId: string } = {
      userId: this.userId,
    };
    this.saveEvent.emit(saveData);
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  validate(): boolean {
    this.userIdEmpty = false;
    let errors: string[] = [];

    if (!this.userId || this.userId.trim().length === 0) {
      this.userIdEmpty = true;
      errors.push('AccountingModule::Error:UserIdEmpty');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        this.messageService.error(err);
      }
      return false;
    }

    return true;
  }

  resetUserIdValidator(): void {
    this.userIdEmpty = false;
  }

  openUserSelectionDialog(): void {
    this.identitySelectionService.openUserSelectionDialog({
      title: this.localizationService.instant('Infrastructure::UserSelection'),
      permissions: [],
      selectedUsers: this.selectedUser ? [this.selectedUser] : [],
      ignoredUsers: [],
      isMultiple: false,
      onSelect: (users) => {
        if (users && users.length > 0) {
          this.selectedUser = users[0];
          this.selectedEntityName = users[0].name || '';
          this.userId = users[0].id || '';
          this.resetUserIdValidator();
        }
      }
    });
  }
}
