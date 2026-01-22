import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PackageTemplateService } from '@eleon/accounting-proxy';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import {
  BillingPeriodType,
  PackageType,
} from '@eleon/accounting-proxy';
import { generateTempGuid } from '@eleon/angular-sdk.lib';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import {
  PackageTemplateDto,
  PackageTemplateModuleDto,
} from '@eleon/accounting-proxy';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from '@eleon/primeng-ui.lib';

interface PackageTemplateModuleRow {
  data: PackageTemplateModuleDto;
  rowUniqueId: number;
}

interface PackageTemplateHeader {
  data: PackageTemplateDto;
  rows: PackageTemplateModuleRow[];
  nameEmpty: boolean;
}

@Component({
  selector: 'app-package-template-create',
  standalone: false,
  templateUrl: './package-template-create.component.html',
  styleUrls: ['./package-template-create.component.scss'],
})
export class PackageTemplateCreateComponent implements OnInit {
  loading: boolean = false;
  documentObjectType = 'PackageTemplate';
  header = {} as PackageTemplateHeader;
  originalDraft: PackageTemplateDto | null = null;
  title: string;
  isCreatePackageTemplate: boolean = false;
  viewportBreakpoints = viewportBreakpoints;
  localizedBillingPeriodTypes: { value: BillingPeriodType; name: string }[];
  localizedPackageTypes: { value: PackageType; name: string }[];
  currencies: { value: string; name: string }[] = [];
  
  // Dialog properties
  showModuleDialog: boolean = false;
  editingModule: PackageTemplateModuleDto | null = null;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.SAVE({
      action: () => this.savePackageTemplate(),
      disabled: () => this.loading,
      loading: () => false,
    }),
    {
      key: 'AccountingModule::Remove',
      action: () => this.delete(),
      disabled: () => this.loading,
      show: () => !this.isCreatePackageTemplate,
      loading: () => false,
      icon: 'fa fa-trash',
      severity: 'danger',
    },
  ]);

  constructor(
    public messageService: LocalizedMessageService,
    public route: ActivatedRoute,
    public router: Router,
    public localizationService: ILocalizationService,
    public confirmationService: ConfirmationService,
    private pageStateService: PageStateService,
    private packageTemplateService: PackageTemplateService
  ) {}

  ngOnInit(): void {
    this.resetInputs();
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.loadPackageTemplateDetails(params['id']);
      } else {
        this.isCreatePackageTemplate = true;
        this.title = this.localizationService.instant(
          'AccountingModule::PackageTemplateCreation'
        );
      }
    });

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

    this.localizedPackageTypes = Object.keys(PackageType)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: PackageType[name as keyof typeof PackageType],
        name: this.localizationService.instant(
          `Infrastructure::PackageType:${name}`
        ),
      }));

    this.currencies.push({ value: '€', name: '€' });
    this.currencies.push({ value: '$', name: '$' });
    this.currencies.push({ value: '₪', name: '₪' });
  }

  async loadPackageTemplateDetails(id: string) {
    this.loading = true;
    this.packageTemplateService
      .getPackageTemplateByIdById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.resetInputs();
        })
      )
      .subscribe({
        next: async (draft) => {
          this.init(draft);
        },
      });
  }

  init(dto: PackageTemplateDto): void {
    this.originalDraft = dto;
    if (!this.isCreatePackageTemplate) {
      this.title = this.localizationService.instant(
        'AccountingModule::PackageTemplate:EditDraftTitle'
      );
    }
    this.resetInputs();
  }

  resetInputs(): void {
    this.pageStateService.setNotDirty();
    this.header = {
      data: {
        ...this.originalDraft,
        id: this.originalDraft?.id || generateTempGuid(),
        packageTemplateModules:
          this.originalDraft?.packageTemplateModules || [],
        description: this.originalDraft?.description || '',
        maxMembers: this.originalDraft?.maxMembers ?? 0,
        price: this.originalDraft?.price ?? 0,
        systemCurrency: this.originalDraft?.systemCurrency || '',
        packageType: this.originalDraft?.packageType ?? PackageType.User,
      },
      nameEmpty: false,
      rows:
        this.originalDraft?.packageTemplateModules?.map((i, ix) =>
          this.createRow(i, ix)
        ) || [],
    };
  }

  savePackageTemplate() {
    const valid = this.validateHeader();
    if (!valid) return;
    const dto: PackageTemplateDto = {
      ...this.header.data,
      packageTemplateModules: this.header.rows.map((row, ix) => ({
        ...row.data,
      })),
    };

    this.loading = true;
    if (this.isCreatePackageTemplate) {
      this.packageTemplateService
        .createPackageTemplateByUpdatedDto(dto)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe((reply) => {
          this.isCreatePackageTemplate = false;
          this.router.navigate(['/account/packagetemplate/details', reply.id]);
        });
    } else {
      this.packageTemplateService
        .updatePackageTemplateByUpdatedDto(dto)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe((reply) => {
          if (reply) {
            this.pageStateService.setNotDirty();
            this.messageService.success(
              'AccountingModule::Success:PackageTemplateSaved'
            );
            this.init(reply);
          } else {
            this.messageService.error(
              'AccountingModule::Error:PackageTemplateSaved'
            );
          }
        });
    }
  }

  delete() {
    this.loading = true;
    this.packageTemplateService
      .removePackageTemplateById(this.header?.data?.id)
      .subscribe((reply) => {
        this.loading = false;
        if (reply) {
          this.messageService.error(reply);
          return;
        }
        this.messageService.success(
          'AccountingModule::Success:PackageTemplateRemoved'
        );
        this.pageStateService.setNotDirty();
        this.router.navigate(['/account/packagetemplate/dashboard']);
      });
  }

  validateHeader(): boolean {
    let errors: string[] = [];

    if (!this.header?.rows || this.header.rows.length === 0) {
      errors.push('AccountingModule::Error:RowsEmpty');
    }

    if (!this.header.data?.packageName) {
      this.header.nameEmpty = true;
      errors.push('AccountingModule::Error:NameEmpty');
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  resetHeaderValidators() {
    this.header.nameEmpty = false;
  }

  createRow(
    item: PackageTemplateModuleDto,
    id: number
  ): PackageTemplateModuleRow {
    return {
      data: item,
      rowUniqueId: id,
    };
  }

  getRowUniqueId(): number {
    let max = -1;
    for (const item of this.header.rows) {
      if (item.rowUniqueId > max) max = item.rowUniqueId;
    }
    return max + 1;
  }

  addRow(): void {
    this.editingModule = null;
    this.showModuleDialog = true;
  }

  editRow(row: PackageTemplateModuleRow): void {
    this.editingModule = { ...row.data };
    this.showModuleDialog = true;
  }

  onModuleDialogSave(module: PackageTemplateModuleDto): void {
    this.pageStateService.setDirty();
    
    if (this.editingModule) {
      // Editing existing module - find and update the row
      const rowIndex = this.header.rows.findIndex(
        (r) => r.data.id === this.editingModule?.id
      );
      if (rowIndex >= 0) {
        this.header.rows[rowIndex].data = { ...module };
      }
    } else {
      // Adding new module - create a new row
      // Ensure packageTemplateEntityId is set if package template has an id
      if (this.header.data.id && !module.packageTemplateEntityId) {
        module.packageTemplateEntityId = this.header.data.id;
      }
      const newRow = this.createRow(module, this.getRowUniqueId());
      this.header.rows.push(newRow);
    }
    
    this.editingModule = null;
    this.showModuleDialog = false;
  }

  removeRow(rowIndex: number): void {
    this.pageStateService.setDirty();
    this.header.rows.splice(rowIndex, 1);
  }

  getRowsLength() {
    return this.header?.rows?.length > 0 ? this.header?.rows?.length : null;
  }

  onModuleDialogHide(): void {
    this.editingModule = null;
  }
}
