import { Component, OnInit, Output, TemplateRef, EventEmitter, ContentChild, Input } from '@angular/core';
import {
  StorageProviderDto,
  StorageProviderSettingDto,
  StorageProviderTypeDto,
  StorageProviderSettingTypeDto,
  CreateStorageProviderDto,
} from '@eleon/providers-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { StorageProvidersService, StorageProvidersTestService } from '@eleon/providers-proxy';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

interface StorageProvider {
  originalData: StorageProviderDto;
  name: string;
  selectedType?: StorageProviderTypeDto;
  validators: {
    nameEmpty: boolean;
    selectedTypeEmpty: boolean;
  };
  tests: {
    testPassed: boolean;
    testFailed: boolean;
    waitingForTest: boolean;
  };
}

interface TypeDropdownState {
  options: StorageProviderTypeDto[];
  selected?: StorageProviderTypeDto;
}

@Component({
  standalone: false,
  selector: 'app-storage-provider-create-dialog',
  templateUrl: './storage-provider-create-dialog.component.html',
  styleUrl: './storage-provider-create-dialog.component.scss'
})
export class StorageProviderCreateDialogComponent implements OnInit {
loading: boolean = false;
loadingStorageTypes: boolean = false;
@ContentChild(TemplateRef)
public button: TemplateRef<any>;
@Input()
public beforeButton: TemplateRef<any>;
@Output()
createdStorage: EventEmitter<string> = new EventEmitter<string>();
title: string;
display: boolean = false;
provider: StorageProvider;
settings: StorageProviderSettingDto[] = [];
possibleSettings: { [type: string]: StorageProviderSettingTypeDto[] } = {};
typeDropdowns: TypeDropdownState[] = [{ options: [] }];
rootStorageTypes: StorageProviderTypeDto[] = [];
childrenByParent: { [parentName: string]: StorageProviderTypeDto[] } = {};


  constructor(
    public localizationService: ILocalizationService,
    public storageProvidersService: StorageProvidersService,
    public storageProvidersTestService: StorageProvidersTestService,
    public messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadPossibleSettings();
    this.initStorageTypes();
    this.initProvider()
  }

  onStorageTypeChanged(): void {
    this.resetProviderValidators();
    this.resetProviderTests();
    this.initSettings();
    this.provider.validators.selectedTypeEmpty = false;
  }

  loadPossibleSettings(): void {
    this.loading = true;
    this.storageProvidersService.getPossibleSettings().pipe(finalize(() => {
      this.loading = false;
    })).subscribe(list => {
      for (const pair of list) {
        this.possibleSettings[pair.type] = pair.possibleSettings;
      }
      this.initSettings();
    });
  }

  initStorageTypes(): void {
    this.loadingStorageTypes = true;
    this.storageProvidersService.getStorageProviderTypesList().pipe(finalize(() => {
      this.loadingStorageTypes = false;
    })).subscribe(result => {
      this.organizeStorageTypes(result ?? []);
    });
  }

  showDialog() {
    this.display = true;
    this.title = this.localizationService.instant('StorageModule::NewStorageProvider');
    this.initProvider();
    this.loadPossibleSettings();
  }

  initProvider(providerDto?: StorageProviderDto): void {
    this.provider = {
      name: providerDto?.name || '',
      originalData: providerDto,
      selectedType: undefined,
      validators: {
        nameEmpty: false,
        selectedTypeEmpty: false,
      },
      tests: {
        testFailed: false,
        testPassed: false,
        waitingForTest: false,
      },
    };

    this.resetTypeDropdowns();
  }

initSettings(): void {
  this.settings = [];

  if (!this.provider?.selectedType) return;

  const selectedTypeName = this.provider.selectedType.name;
  const possibleSettings = this.possibleSettings[selectedTypeName];
  if (!possibleSettings?.length) return;

  const presetValues =
    selectedTypeName === this.provider.originalData?.storageProviderTypeName
      ? this.provider.originalData?.settings
      : undefined;
for (const possibleSetting of possibleSettings) {
  // possibleSetting is now StorageProviderSettingTypeDto
  const preset = presetValues?.find((x) => x.key === possibleSetting.key);

  this.settings.push({
    id: preset?.id,
    key: possibleSetting.key,
    value: preset?.value ?? possibleSetting.defaultValue ?? '',
    storageProviderId: preset?.storageProviderId
  });
}
}


  resetProviderValidators(): void {
    this.provider.validators.nameEmpty = false;
    this.provider.validators.selectedTypeEmpty = false;
  }

  resetProviderTests(): void {
    this.provider.tests.testFailed = false;
    this.provider.tests.testPassed = false;
  }

  async saveStorageProvider(): Promise<void> {
    const valid = this.validateProvider();
    if (!valid) return;
    const providerDto: CreateStorageProviderDto = {
      name: this.provider.name,
      typeName: this.provider.selectedType?.name,
    };

    try {
        this.loading = true;
        const savedProvider = await this.storageProvidersService
          .createStorageProviderByInput(providerDto)
          .toPromise();

        let id = savedProvider.id;
        if (id?.length > 0) {
          this.success('StorageModule::ProvidersOptions:SaveSuccess');
        } else {
          this.error('StorageModule::ProvidersOptions:SaveFail');
        }

      if(id){
        id = id.replace(/^"|"$/g, '');
        this.createdStorage.emit(id);
        this.display = false;
      }
    } catch (error) {
      this.error('StorageModule::ProvidersOptions:SaveError');
    }
    finally {
      this.loading = false;
    }
  }

  error(msg: string) {
    this.messageService.add({
      severity: "error",
      summary: this.localizationService.instant(msg),
    });
  }
  success(msg: string) {
    this.messageService.add({
      severity: "success",
      summary: this.localizationService.instant(msg),
    });
  }

  validateProvider(): boolean {
    let errors: string[] = [];
    if (!this.provider.name?.length) {
      this.provider.validators.nameEmpty = true;
      errors.push('StorageModule::ProvidersOptions:Error:NameEmpty');
    }
    if (!this.provider?.selectedType) {
      this.provider.validators.selectedTypeEmpty = true;
      errors.push('StorageModule::ProvidersOptions:Error:StorageTypeEmpty');
    }
    if (errors.length === 0) return true;
    for (const err of errors) {
      this.error(err);
    }
    return false;
  }

  closeDialog(){
    this.provider.name = null;
    this.provider.selectedType = undefined;
    this.resetTypeDropdowns();
    this.resetProviderValidators();
    this.display = false;
  }

  onTypeSelection(type: StorageProviderTypeDto | null, levelIndex: number): void {
    this.resetProviderValidators();

    const truncatedDropdowns = this.typeDropdowns
      .slice(0, levelIndex + 1)
      .map((dropdown, index) => {
        if (index === levelIndex) {
          return { ...dropdown, selected: type ?? undefined };
        }
        return dropdown;
      });

    this.typeDropdowns = truncatedDropdowns;
    this.provider.selectedType = undefined;
    this.settings = [];

    if (!type) {
      return;
    }

    const children = this.childrenByParent[type.name] ?? [];
    if (children.length) {
      this.typeDropdowns = [
        ...this.typeDropdowns,
        { options: children, selected: undefined },
      ];
      return;
    }

    this.provider.selectedType = type;
    this.onStorageTypeChanged();
  }

  private organizeStorageTypes(types: StorageProviderTypeDto[]): void {
    this.rootStorageTypes = [];
    this.childrenByParent = {};

    for (const type of types) {
      if (type.parent) {
        if (!this.childrenByParent[type.parent]) {
          this.childrenByParent[type.parent] = [];
        }
        this.childrenByParent[type.parent].push(type);
      } else {
        this.rootStorageTypes.push(type);
      }
    }

    this.resetTypeDropdowns();
  }

  private resetTypeDropdowns(): void {
    this.typeDropdowns = [
      {
        options: [...this.rootStorageTypes],
        selected: this.rootStorageTypes[0],
      },
    ];
    this.onTypeSelection(this.rootStorageTypes[0], 0);

    if (this.provider) {
      this.provider.selectedType = undefined;
    }

    this.settings = [];
  }

}
