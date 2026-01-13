import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PackageModuleType, PackageTemplateModuleDto } from '@eleon/accounting-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { generateTempGuid } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-package-template-module-create',
  templateUrl: './package-template-module-create.component.html',
  styleUrls: ['./package-template-module-create.component.scss']
})
export class PackageTemplateModuleCreateComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  moduleData: PackageTemplateModuleDto | null = null;

  @Input()
  packageTemplateEntityId: string | undefined;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  saveEvent = new EventEmitter<PackageTemplateModuleDto>();

  editedModule: PackageTemplateModuleDto = {
    id: generateTempGuid(),
    packageTemplateEntityId: '',
    name: '',
    refId: undefined,
    moduleType: PackageModuleType.User,
    description: '',
    moduleData: '',
  };

  moduleTypeOptions = [
    { value: PackageModuleType.User, name: '' },
    { value: PackageModuleType.Role, name: '' },
    { value: PackageModuleType.OrgUnit, name: '' },
    { value: PackageModuleType.Feature, name: '' },
    { value: PackageModuleType.Service, name: '' },
  ];

  nameEmpty: boolean = false;
  loading: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private pageStateService: PageStateService
  ) {}

  ngOnInit(): void {
    this.initializeModuleTypes();
  }

  ngOnChanges(): void {
    // Changes will be handled in onDialogShow when dialog becomes visible
  }

  initializeModuleTypes(): void {
    this.moduleTypeOptions = [
      {
        value: PackageModuleType.User,
        name: this.localizationService.instant(
          `AccountingModule::PackageModuleType:${PackageModuleType[PackageModuleType.User]}`
        ),
      },
      {
        value: PackageModuleType.Role,
        name: this.localizationService.instant(
          `AccountingModule::PackageModuleType:${PackageModuleType[PackageModuleType.Role]}`
        ),
      },
      {
        value: PackageModuleType.OrgUnit,
        name: this.localizationService.instant(
          `AccountingModule::PackageModuleType:${PackageModuleType[PackageModuleType.OrgUnit]}`
        ),
      },
      {
        value: PackageModuleType.Feature,
        name: this.localizationService.instant(
          `AccountingModule::PackageModuleType:${PackageModuleType[PackageModuleType.Feature]}`
        ),
      },
      {
        value: PackageModuleType.Service,
        name: this.localizationService.instant(
          `AccountingModule::PackageModuleType:${PackageModuleType[PackageModuleType.Service]}`
        ),
      },
    ];
  }

  showModuleData(): boolean {
    return [PackageModuleType.Feature, PackageModuleType.Service].includes(this.editedModule.moduleType);
  }

  onDialogShow(): void {
    if (this.moduleData) {
      // Editing existing module
      this.editedModule = {
        ...this.moduleData,
      };
    } else {
      // Creating new module
      this.editedModule = {
        id: generateTempGuid(),
        packageTemplateEntityId: this.packageTemplateEntityId || '',
        name: '',
        refId: undefined,
        moduleType: PackageModuleType.User,
        description: '',
        moduleData: '',
      };
    }
    this.nameEmpty = false;
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  save(): void {
    const valid = this.validate();
    if (!valid) return;

    this.pageStateService.setDirty();
    this.saveEvent.emit({ ...this.editedModule });
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  validate(): boolean {
    this.nameEmpty = false;
    let errors: string[] = [];

    if (!this.editedModule.name || this.editedModule.name.trim().length === 0) {
      this.nameEmpty = true;
      errors.push('AccountingModule::Error:ModuleNameEmpty');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        this.messageService.error(err);
      }
      return false;
    }

    return true;
  }

  resetNameValidator(): void {
    this.nameEmpty = false;
  }
}

