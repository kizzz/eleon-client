import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import {
  AccountPackageService,
  AccountPackageDto,
  CreateAccountPackageDto,
  BillingPeriodType,
  PackageTemplateDto,
} from '@eleon/accounting-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';

interface AccountPackageForm {
  packageTemplate: PackageTemplateDto | null;
  billingPeriodType: BillingPeriodType | null;
  oneTimeDiscount: number;
  permanentDiscount: number;
  autoRenewal: boolean;
  autoSuspention: boolean;
  validators: {
    packageTemplateNotSelected: boolean;
  };
}

@Component({
  standalone: false,
  selector: 'app-account-package-create-dialog',
  templateUrl: './account-package-create-dialog.component.html',
  styleUrls: ['./account-package-create-dialog.component.scss']
})
export class AccountPackageCreateDialogComponent implements OnInit, OnChanges {
  loading: boolean = false;
  @Input()
  display: boolean = false;
  @Output()
  displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input()
  accountId: string;
  @Input()
  accountPackageId?: string;
  @Input()
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[] = [];
  @Output()
  saved: EventEmitter<AccountPackageDto> = new EventEmitter<AccountPackageDto>();

  accountPackage: AccountPackageForm;
  title: string;
  isEditMode: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public accountPackageService: AccountPackageService,
    public messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.initAccountPackage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display'] && changes['display'].currentValue === true) {
      this.showDialog();
      // If accountPackageId is already set, load the package
      if (this.accountPackageId) {
        this.loadAccountPackage(this.accountPackageId);
      }
    }
    if (changes['accountPackageId'] && this.display) {
      if (this.accountPackageId) {
        this.loadAccountPackage(this.accountPackageId);
      } else {
        this.initAccountPackage();
      }
    }
  }

  showDialog(): void {
    this.isEditMode = !!this.accountPackageId;
    if (this.isEditMode) {
      this.title = this.localizationService.instant('AccountingModule::AccountPackageEdit');
      // loadAccountPackage will be called from ngOnChanges if accountPackageId is set
    } else {
      this.title = this.localizationService.instant('AccountingModule::AccountPackageCreation');
      this.initAccountPackage();
    }
  }

  initAccountPackage(): void {
    this.accountPackage = {
      packageTemplate: null,
      billingPeriodType: BillingPeriodType.None,
      oneTimeDiscount: 0,
      permanentDiscount: 0,
      autoRenewal: false,
      autoSuspention: false,
      validators: {
        packageTemplateNotSelected: false,
      },
    };
  }

  loadAccountPackage(id: string): void {
    if (!id) return;

    this.loading = true;
    this.accountPackageService
      .getAccountPackage(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (packageDto) => {
          this.accountPackage = {
            packageTemplate: packageDto.packageTemplate || null,
            billingPeriodType: packageDto.billingPeriodType,
            oneTimeDiscount: packageDto.oneTimeDiscount,
            permanentDiscount: packageDto.permanentDiscount,
            autoRenewal: packageDto.autoRenewal,
            autoSuspention: packageDto.autoSuspention,
            validators: {
              packageTemplateNotSelected: false,
            },
          };
        },
        error: (error) => {
          this.messageService.error('AccountingModule::Error:LoadAccountPackageFailed');
          console.error('Error loading account package:', error);
        },
      });
  }

  resetValidators(): void {
    this.accountPackage.validators.packageTemplateNotSelected = false;
  }

  async saveAccountPackage(): Promise<void> {
    const valid = this.validateAccountPackage();
    if (!valid) return;

    this.loading = true;

    if (this.isEditMode && this.accountPackageId) {
      // Update existing package
      const updateDto: AccountPackageDto = {
        id: this.accountPackageId,
        packageTemplateEntityId: this.accountPackage.packageTemplate?.id,
        billingPeriodType: this.accountPackage.billingPeriodType!,
        oneTimeDiscount: this.accountPackage.oneTimeDiscount,
        permanentDiscount: this.accountPackage.permanentDiscount,
        autoRenewal: this.accountPackage.autoRenewal,
        autoSuspention: this.accountPackage.autoSuspention,
        status: {} as any, // Will be preserved by backend
        packageTemplate: this.accountPackage.packageTemplate || undefined,
        name: this.accountPackage.packageTemplate?.packageName,
        totalLinkedMembers: 0
      };

      this.accountPackageService
        .updateAccountPackage(updateDto)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (updatedPackage) => {
            this.messageService.success('AccountingModule::Success:AccountPackageSaved');
            this.saved.emit(updatedPackage);
            this.closeDialog();
          },
          error: (error) => {
            this.messageService.error('AccountingModule::Error:AccountPackageSaved');
            console.error('Error updating account package:', error);
          },
        });
    } else {
      // Create new package
      const createDto: CreateAccountPackageDto = {
        packageTemplateEntityId: this.accountPackage.packageTemplate?.id,
        billingPeriodType: this.accountPackage.billingPeriodType!,
        oneTimeDiscount: this.accountPackage.oneTimeDiscount,
        permanentDiscount: this.accountPackage.permanentDiscount,
        autoRenewal: this.accountPackage.autoRenewal,
        autoSuspention: this.accountPackage.autoSuspention,
      };

      this.accountPackageService
        .addAccountPackage(this.accountId, createDto)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (createdPackage) => {
            this.messageService.success('AccountingModule::Success:AccountPackageSaved');
            this.saved.emit(createdPackage);
            this.closeDialog();
          },
          error: (error) => {
            this.messageService.error('AccountingModule::Error:AccountPackageSaved');
            console.error('Error creating account package:', error);
          },
        });
    }
  }

  validateAccountPackage(): boolean {
    let errors: string[] = [];

    if (!this.accountPackage.packageTemplate || !this.accountPackage.packageTemplate.id) {
      this.accountPackage.validators.packageTemplateNotSelected = true;
      errors.push('AccountingModule::Error:PackageTemplateNotSelected');
    }

    if (this.accountPackage.billingPeriodType === null || this.accountPackage.billingPeriodType === undefined) {
      errors.push('AccountingModule::Error:BillingPeriodTypeNotSelected');
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  onPackageTemplateSelected(template: PackageTemplateDto): void {
    this.accountPackage.packageTemplate = template;
    this.accountPackage.billingPeriodType = template.billingPeriodType;
    this.resetValidators();
  }

  closeDialog(): void {
    this.initAccountPackage();
    this.accountPackageId = undefined;
    this.isEditMode = false;
    this.display = false;
    this.displayChange.emit(false);
  }
}
