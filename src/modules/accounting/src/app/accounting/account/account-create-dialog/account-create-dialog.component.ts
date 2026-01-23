import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {
  AccountService,
  CreateAccountDto,
} from '@eleon/accounting-proxy';
import { ILocalizationService, IIdentitySelectionDialogService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { CommonUserDto } from '@eleon/angular-sdk.lib';

interface Account {
  accountName: string;
  owner: CommonUserDto | null;
  validators: {
    accountNameEmpty: boolean;
    ownerNotSelected: boolean;
  };
}

@Component({
  standalone: false,
  selector: 'app-account-create-dialog',
  templateUrl: './account-create-dialog.component.html',
  styleUrl: './account-create-dialog.component.scss'
})
export class AccountCreateDialogComponent implements OnInit {
  loading: boolean = false;
  @Output()
  createdAccount: EventEmitter<string> = new EventEmitter<string>();
  title: string;
  @Input()
  display: boolean = false;
  @Output()
  displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  account: Account;

  constructor(
    public localizationService: ILocalizationService,
    public accountService: AccountService,
    public messageService: LocalizedMessageService,
    private identitySelectionService: IIdentitySelectionDialogService
  ) {}

  ngOnInit(): void {
    this.initAccount();
  }

  showDialog() {
    this.display = true;
    this.title = this.localizationService.instant('AccountingModule::AccountCreation');
    this.initAccount();
  }

  initAccount(): void {
    this.account = {
      accountName: '',
      owner: null,
      validators: {
        accountNameEmpty: false,
        ownerNotSelected: false,
      },
    };
  }

  resetAccountValidators(): void {
    this.account.validators.accountNameEmpty = false;
    this.account.validators.ownerNotSelected = false;
  }

  async saveAccount(): Promise<void> {
    const valid = this.validateAccount();
    if (!valid) return;

    const accountDto: CreateAccountDto = {
      accountName: this.account.accountName,
      ownerId: this.account.owner?.id,
    };

    try {
      this.loading = true;
      const savedAccount = await this.accountService
        .createAccountByDto(accountDto)
        .toPromise();

      if (savedAccount?.id) {
        this.messageService.success('AccountingModule::CreateAccount:Success');
        this.createdAccount.emit(savedAccount.id);
        this.display = false;
        this.displayChange.emit(false);
      } else {
        this.messageService.error('AccountingModule::CreateAccount:Error');
      }
    } catch (error) {
      this.messageService.error('AccountingModule::CreateAccount:Error');
    } finally {
      this.loading = false;
    }
  }

  validateAccount(): boolean {
    let errors: string[] = [];
    if (!this.account.accountName?.length) {
      this.account.validators.accountNameEmpty = true;
      errors.push('AccountingModule::Error:NameEmpty');
    }
    if (!this.account.owner?.id) {
      this.account.validators.ownerNotSelected = true;
      errors.push('AccountingModule::Error:OwnerNotSelected');
    }
    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  closeDialog() {
    this.account.accountName = '';
    this.account.owner = null;
    this.resetAccountValidators();
    this.display = false;
    this.displayChange.emit(false);
  }

  onOwnerSelected(users: CommonUserDto[]): void {
    if (users && users.length > 0) {
      const selectedUser = users[0];
      this.account.owner = selectedUser;
      this.resetAccountValidators();
    }
  }

  openOwnerSelectionDialog(): void {
    this.identitySelectionService.openUserSelectionDialog({
      title: this.localizationService.instant('AccountingModule::Header:Owner'),
      permissions: [],
      selectedUsers: this.account.owner?.id ? [this.account.owner] : [],
      ignoredUsers: [],
      isMultiple: false,
      onSelect: (users) => this.onOwnerSelected(users)
    });
  }
}
