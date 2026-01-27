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
  email: string;
  validators: {
    accountNameEmpty: boolean;
    emailEmpty: boolean;
    emailInvalid: boolean;
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
    public messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.initAccount();
    this.title = this.localizationService.instant('AccountingModule::AccountCreation');
  }

  showDialog() {
    this.display = true;
    this.initAccount();
  }

  initAccount(): void {
    this.account = {
      accountName: '',
      email: '',
      validators: {
        accountNameEmpty: false,
        emailEmpty: false,
        emailInvalid: false,
      },
    };
  }

  resetAccountValidators(): void {
    this.account.validators.accountNameEmpty = false;
    this.account.validators.emailEmpty = false;
    this.account.validators.emailInvalid = false;
  }

  async saveAccount(): Promise<void> {
    const valid = this.validateAccount();
    if (!valid) return;

    const accountDto: CreateAccountDto = {
      name: this.account.accountName,
      contactPersonEmail: this.account.email,
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
    if (!this.account.email?.length) {
      this.account.validators.emailEmpty = true;
      errors.push('AccountingModule::Error:EmailEmpty');
    }

    if(this.account.email?.length > 0){
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.account.email)) {
        this.account.validators.emailInvalid = true;
        errors.push("TenantManagement::User:EmailInvalid");
      }
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  closeDialog() {
    this.account.accountName = '';
    this.account.email = '';
    this.resetAccountValidators();
    this.display = false;
    this.displayChange.emit(false);
  }

}
