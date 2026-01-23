import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core";
import {
  AccountService,
} from '@eleon/accounting-proxy';
import { AccountPackageDto } from '@eleon/accounting-proxy';
import { viewportBreakpoints } from "@eleon/angular-sdk.lib";
import {
  PaymentMethod,
  AccountStatus,
  BillingPeriodType,
} from '@eleon/accounting-proxy';
import { ConfirmationService } from "primeng/api";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { AccountDto } from '@eleon/accounting-proxy';
import { PageControls, contributeControls } from "@eleon/primeng-ui.lib";
import { CommonUserDto, IUserService } from '@eleon/angular-sdk.lib';

interface AccountDetails {
  data: AccountDto;
  owner: CommonUserDto;
  completionMessage: string;
}


@Component({
  standalone: false,
  selector: "app-account-readonly-details",
  templateUrl: "./account-readonly-details.component.html",
  styleUrls: ["./account-readonly-details.component.scss"],
})
export class AccountReadonlyDetailsComponent implements OnInit {
  viewportBreakpoints = viewportBreakpoints;
  AccountStatus = AccountStatus;
  loading: boolean = false;
  documentObjectType = 'Account';
  accountPackageDocType = 'AccountPackage';
  originalDraft: AccountDto;
  title: string;
  details = {} as AccountDetails;
  attachmentsCount: number = 0;
  tmpCurrency: string = "€";
  isArchive = false;
  archiveVersion: string = null;
  displayLifecycle: boolean = true;
  displayTotals: boolean = true;
  displaySubscribtions: boolean = true;
  displayAttachments: boolean = true;

  @PageControls()
  controls = contributeControls([
    {
      key: "AccountingModule::Resend",
      action: () => this.resendInfo(),
      disabled: () => this.loading,
      show: () => this.isCompleted(),
      loading: () => this.loading,
      icon: "fas fa-envelope-open",
      severity: "warning",
    },
    {
      key: "AccountingModule::Reset",
      action: () => this.resetInfo(),
      disabled: () => this.loading,
      show: () => this.isCompleted(),
      loading: () => this.loading,
      icon: "pi pi-sync",
      severity: "info",
    },
    {
      key: "AccountingModule::Cancel",
      action: () => this.cancel(),
      disabled: () => this.loading,
      show: () => this.isCompleted() && (this.isActive() || this.isSuspended()),
      loading: () => this.loading,
      icon: "fa fa-trash",
      severity: "danger",
    },
    {
      key: "AccountingModule::Suspend",
      action: () => this.suspend(),
      disabled: () => this.loading,
      show: () => this.isCompleted() && this.isActive(),
      loading: () => this.loading,
      icon: "pi pi-times-circle",
      severity: "danger",
    },
    {
      key: "AccountingModule::Activate",
      action: () => this.activate(),
      disabled: () => this.loading,
      show: () => this.isSuspended(),
      loading: () => this.loading,
      icon: "fas fa-play",
      severity: "success",
    },
  ]);

  constructor(
    public messageService: LocalizedMessageService,
    public route: ActivatedRoute,
    public router: Router,
    public localizationService: ILocalizationService,
    public confirmationService: ConfirmationService,
    private userService: IUserService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();
  }

  loadAccountDetails(): void {
    this.route.params.subscribe((params: Params) => {
      const id = params["id"];
      this.route.queryParams.subscribe((queryParams: Params) => {
        const version = queryParams["version"];
        if (id) {
          this.loading = true;
          this.accountService
            .getAccountDetailsByIdById(id)
            .subscribe({
              next: (so) => {
                this.isArchive = !!version;
                this.archiveVersion = version;
                if (this.isArchive) {
                  this.displaySubscribtions = true;
                  this.displayAttachments = false;
                  this.displayLifecycle = false;
                }
                this.loading = false;
                this.init(so);
                this.title = this.localizationService.instant(
                  "AccountingModule::AccountDetails"
                );
              },
            });
        }
      });
    });
  }

  init(so: AccountDto): void {
    this.details = {
      completionMessage: '',
      data: so,
      owner: { id: so.ownerId, name: '' }as CommonUserDto,
    };

    const emptyGuid = '00000000-0000-0000-0000-000000000000';
    if (this.details.data.ownerId && this.details.data.ownerId !== emptyGuid) {
      this.userService.getById(this.details.data.ownerId).subscribe({
        next: (user) => {
          this.details.owner = user;
        }
      });
    }
  }

  getPaymentMethod(method: number) {
    return this.localizationService.instant(
      "Infrastructure::PaymentMethod:" + PaymentMethod[method]
    );
  }

  onAttachmentsCountChange(count): void {
    this.attachmentsCount = count;
  }

  isCompleted(): boolean {
    return this.details?.data?.accountStatus == AccountStatus.Active;
  }

  isConfirmation() {
    return false;
  }

  isExecution() {
    return false;
  }

  isRejected() {
    return false;
  }

  isCanceled() {
    return this.details?.data?.accountStatus == AccountStatus.Canceled;
  }

  isNew() {
    return this.details?.data?.accountStatus == AccountStatus.New;
  }

  isDraft() {
    return false;
  }

  isActive() {
    return this.details?.data?.accountStatus == AccountStatus.Active;
  }

  isSuspended() {
    return this.details?.data?.accountStatus == AccountStatus.Suspended;
  }

  getBillingPeriodTypeName(type: number) {
    return this.localizationService.instant(
      "Infrastructure::BillingPeriodType:" + BillingPeriodType[type]
    );
  }

  confirmationMessage(handler) {
    return handler;
  }

  getPrice(row: AccountPackageDto): number {
    let sum = 0;
    if (row.billingPeriodType == BillingPeriodType.Year) {
      sum = sum * 12;
    }

    if (row.oneTimeDiscount > 0) {
      let discount = row.oneTimeDiscount;
      sum = sum - (sum * discount) / 100;
    } else if (row.permanentDiscount) {
      let discount = row.permanentDiscount;
      sum = sum - (sum * discount) / 100;
    }

    return sum;
  }

  resendInfo() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "AccountingModule::ResendMsgWarning"
      ),
      accept: () => {
        this.loading = true;
        this.accountService
          .resendAccountInfoById(this.details.data.id)
          .subscribe((reply) => {
            this.loading = false;
            if (reply) {
              this.messageService.error(reply);
              return;
            }
            this.messageService.success("AccountingModule::Success:Resend");
            this.router.navigate(["/account/dashboard"]);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  resetInfo() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "AccountingModule::ResetMsgWarning"
      ),
      accept: () => {
        this.loading = true;
        this.accountService
          .resetAccountById(this.details.data.id)
          .subscribe((reply) => {
            this.loading = false;
            if (reply) {
              this.messageService.error(reply);
              return;
            }
            this.messageService.success("AccountingModule::Success:Reset");
            this.router.navigate(["/account/dashboard"]);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  cancel() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "AccountingModule::CancelMsgWarning"
      ),
      accept: () => {
        this.loading = true;
        this.accountService
          .cancelAccountById(this.details.data.id)
          .subscribe((reply) => {
            this.loading = false;
            if (reply) {
              this.messageService.error(reply);
              return;
            }
            this.messageService.success("AccountingModule::Success:Cancel");
            this.router.navigate(["/account/dashboard"]);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  suspend() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "AccountingModule::SuspendMsgWarning"
      ),
      accept: () => {
        this.loading = true;
        this.accountService
          .suspendAccountById(this.details.data.id)
          .subscribe((reply) => {
            this.loading = false;
            if (reply) {
              this.messageService.error(reply);
              return;
            }
            this.messageService.success("AccountingModule::Success:Suspend");
            this.router.navigate(["/account/dashboard"]);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  activate() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "AccountingModule::ActivateMsgWarning"
      ),
      accept: () => {
        this.loading = true;
        this.accountService
          .activateAccountById(this.details.data.id)
          .subscribe((reply) => {
            this.loading = false;
            if (reply) {
              this.messageService.error(reply);
              return;
            }
            this.messageService.success("AccountingModule::Success:Activate");
            this.router.navigate(["/account/dashboard"]);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }
}
