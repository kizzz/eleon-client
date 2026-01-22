import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {
  PackageTemplateService,
  PackageTemplateDto,
  BillingPeriodType,
  PackageType,
} from '@eleon/accounting-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { generateTempGuid } from '@eleon/angular-sdk.lib';

interface PackageTemplate {
  packageName: string;
  billingPeriodType: BillingPeriodType | null;
  validators: {
    packageNameEmpty: boolean;
    billingPeriodTypeNotSelected: boolean;
  };
}

@Component({
  standalone: false,
  selector: 'app-package-template-create-dialog',
  templateUrl: './package-template-create-dialog.component.html',
  styleUrl: './package-template-create-dialog.component.scss'
})
export class PackageTemplateCreateDialogComponent implements OnInit {
  loading: boolean = false;
  @Output()
  createdPackageTemplate: EventEmitter<string> = new EventEmitter<string>();
  title: string;
  @Input()
  display: boolean = false;
  @Output()
  displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  packageTemplate: PackageTemplate;
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[] = [];

  constructor(
    public localizationService: ILocalizationService,
    public packageTemplateService: PackageTemplateService,
    public messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.initBillingPeriodTypes();
    this.initPackageTemplate();
  }

  initBillingPeriodTypes(): void {
    this.localizedBillingPeriodTypes = [
      BillingPeriodType.Month,
      BillingPeriodType.Year,
      BillingPeriodType.Weekly,
      BillingPeriodType.Quarterly,
      BillingPeriodType.None,
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::BillingPeriodType:${BillingPeriodType[value]}`
      ),
    }));
  }

  showDialog() {
    this.display = true;
    this.title = this.localizationService.instant('AccountingModule::PackageTemplateCreation');
    this.initPackageTemplate();
  }

  initPackageTemplate(): void {
    this.packageTemplate = {
      packageName: '',
      billingPeriodType: null,
      validators: {
        packageNameEmpty: false,
        billingPeriodTypeNotSelected: false,
      },
    };
  }

  resetPackageTemplateValidators(): void {
    this.packageTemplate.validators.packageNameEmpty = false;
    this.packageTemplate.validators.billingPeriodTypeNotSelected = false;
  }

  async savePackageTemplate(): Promise<void> {
    const valid = this.validatePackageTemplate();
    if (!valid) return;

    const packageTemplateDto: PackageTemplateDto = {
      id: generateTempGuid(),
      packageName: this.packageTemplate.packageName,
      billingPeriodType: this.packageTemplate.billingPeriodType!,
      packageTemplateModules: [],
      packageType: PackageType.User,
      maxMembers: 0,
      price: 0,
    };

    try {
      this.loading = true;
      const savedPackageTemplate = await this.packageTemplateService
        .createPackageTemplateByUpdatedDto(packageTemplateDto)
        .toPromise();

      if (savedPackageTemplate?.id) {
        this.messageService.success('AccountingModule::Success:PackageTemplateSaved');
        this.createdPackageTemplate.emit(savedPackageTemplate.id);
        this.display = false;
        this.displayChange.emit(false);
      } else {
        this.messageService.error('AccountingModule::Error:PackageTemplateSaved');
      }
    } catch (error) {
      this.messageService.error('AccountingModule::Error:PackageTemplateSaved');
    } finally {
      this.loading = false;
    }
  }

  validatePackageTemplate(): boolean {
    let errors: string[] = [];
    if (!this.packageTemplate.packageName?.length) {
      this.packageTemplate.validators.packageNameEmpty = true;
      errors.push('AccountingModule::Error:NameEmpty');
    }
    if (this.packageTemplate.billingPeriodType === null || this.packageTemplate.billingPeriodType === undefined) {
      this.packageTemplate.validators.billingPeriodTypeNotSelected = true;
      errors.push('AccountingModule::Error:BillingPeriodTypeNotSelected');
    }
    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  closeDialog() {
    this.packageTemplate.packageName = '';
    this.packageTemplate.billingPeriodType = null;
    this.resetPackageTemplateValidators();
    this.display = false;
    this.displayChange.emit(false);
  }
}
