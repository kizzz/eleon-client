import {
  StorageProviderSettingDto,
  StorageProviderSettingsTypes,
  StorageProviderSettingTypeDto,
  StorageProviderTypeDto,
} from '@eleon/providers-proxy';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  StorageProvidersService,
  StorageProvidersTestService,
  StorageProviderDto,
} from '@eleon/providers-proxy';
import {
  LocalizedMessageService,
  LocalizedConfirmationService,
} from '@eleon/primeng-ui.lib';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { finalize } from 'rxjs';

import {
  IFileExplorerDialogService,
  ILocalizationService,
} from '@eleon/angular-sdk.lib';
interface StorageProvider {
  originalData: StorageProviderDto;
  name: string;
  validators: {
    nameEmpty: boolean;
  };
  tests: {
    testPassed: boolean;
    testFailed: boolean;
    waitingForTest: boolean;
  };
}

interface StorageProviderSettingWithType extends StorageProviderSettingDto {
  type: StorageProviderSettingTypeDto;
}

@Component({
  standalone: false,
  selector: 'app-storage-provider-config',
  templateUrl: './storage-provider-config.component.html',
  styleUrls: ['./storage-provider-config.component.scss'],
})
export class StorageProviderConfigComponent implements OnInit {
  storageProviderSettingsTypes = StorageProviderSettingsTypes;
  provider: StorageProvider;
  settings: StorageProviderSettingWithType[];
  title: string;
  possibleSettings = {} as Record<string, StorageProviderSettingTypeDto[]>;
  loadingSettings: boolean = false;
  loadingProvider: boolean = false;
  editMode: boolean = false;
  loading: boolean = false;
  isActiveOptions = [
    {
      label: this.localizationService.instant('Infrastructure::Yes'),
      value: true,
    },
    {
      label: this.localizationService.instant('Infrastructure::No'),
      value: false,
    },
  ];
  boolSettingsOptions = [
    {
      label: this.localizationService.instant('Infrastructure::Yes'),
      value: 'true',
    },
    {
      label: this.localizationService.instant('Infrastructure::No'),
      value: 'false',
    },
  ];

  @PageControls()
  controls = contributeControls([
    // {
    //   key: 'StorageModule::ProvidersOptions:Test',
    //   icon: 'pi pi-file-o',
    //   severity: 'warning',
    //   loading: () => this.loading,
    //   disabled: () => this.loading,
    //   show: () => true,
    //   action: () => this.testStorageProvider(),
    // },
    {
      key: 'StorageModule::ProvidersOptions:Explore',
      icon: 'pi pi-file-o',
      severity: 'warning',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => !this.editMode,
      action: () => this.exploreStorageProvider(),
    },
    {
      key: 'Infrastructure::Edit',
      icon: 'fa fa-edit',
      severity: 'info',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => !this.editMode,
      action: () => (this.editMode = true),
    },
    {
      key: 'Infrastructure::Delete',
      icon: 'fa fa-trash',
      severity: 'danger',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => !this.editMode,
      action: () => this.deleteStorageProvider(),
    },
    {
      key: 'Infrastructure::Cancel',
      icon: 'fa fa-times',
      severity: 'danger',
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.editMode && this.provider?.originalData?.id?.length > 0,
      action: () => this.cancelEditing(),
    },
    PAGE_CONTROLS.SAVE({
      loading: () => this.loading,
      action: () => this.saveStorageProvider(),
      disabled: () => this.loading,
      show: () => this.editMode,
    }),
  ]);

  constructor(
    public localizationService: ILocalizationService,
    public storageProvidersService: StorageProvidersService,
    public storageProvidersTestService: StorageProvidersTestService,
    public messageService: LocalizedMessageService,
    public router: Router,
    public route: ActivatedRoute,
    public state: PageStateService,
    public confirmationService: LocalizedConfirmationService,
    private fileExplorerDialogService: IFileExplorerDialogService
  ) {}

  ngOnInit(): void {
    this.state.setNotDirty();
    this.subscribeToUrlChange();
    this.loadPossibleSettings();
  }

  subscribeToUrlChange(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.reloadStorageProvider(params['id']);
      } else {
        this.title = this.localizationService.instant(
          'StorageModule::ProvidersOptions:Config:Title:New'
        );
        this.editMode = true;
        this.initProvider();
        this.loadPossibleSettings();
      }
    });
  }

  reloadStorageProvider(id: string): void {
    this.storageProvidersService
      .getStorageProviderByStorageProviderId(id)
      .subscribe({
        next: (provider) => {
          this.initProvider(provider);
          this.loadPossibleSettings();
          this.title = this.localizationService.instant(
            'StorageModule::ProvidersOptions:Config:Title:Edit',
            provider.name
          );
        },
      });
  }

  loadPossibleSettings(): void {
    this.loadingSettings = true;
    this.storageProvidersService.getPossibleSettings().subscribe((list) => {
      for (const pair of list) {
        this.possibleSettings[pair.type] = pair.possibleSettings;
      }
      this.initSettings();
      this.loadingSettings = false;
    });
  }

  initProvider(providerDto?: StorageProviderDto): void {
    this.provider = {
      name: providerDto?.name || '',
      originalData: providerDto,
      validators: {
        nameEmpty: false,
      },
      tests: {
        testFailed: false,
        testPassed: false,
        waitingForTest: false,
      },
    };
  }

  initSettings(): void {
    this.settings = [];

    const possibleSettings =
      this.possibleSettings[this.provider?.originalData.storageProviderTypeName];
    if (!possibleSettings?.length) {
      return;
    }

    const savedSettings = this.provider.originalData.settings || [];

    const provider = this.provider.originalData;
    for (const possibleSetting of possibleSettings) {
      const savedSetting = savedSettings.find(
        (s) => s.key === possibleSetting.key
      );

      this.settings.push({
        id: provider.id,
        storageProviderId: provider.id,
        key: possibleSetting.key,
        value: savedSetting?.value || possibleSetting.defaultValue || '',
        type: possibleSetting,
      });
    }
  }

  onStorageTypeChanged(): void {
    this.resetProviderValidators();
    this.resetProviderTests();
    this.initSettings();
  }

  resetForm(): void {
    this.state.setNotDirty();
    this.initSettings();
    this.resetProviderTests();
    this.resetProviderValidators();
  }

  resetProviderValidators(): void {
    this.provider.validators.nameEmpty = false;
  }

  resetProviderTests(): void {
    this.provider.tests.testFailed = false;
    this.provider.tests.testPassed = false;
  }

  // getSettingKeyLocalization(setting: StorageProviderSettingTypeDto): string {
  //   if (this.provider.selectedType === undefined) return undefined;

  //   if (setting.type !== StorageProviderSettingsTypes.ConstSetting)
  //     return setting.key;

  //   const type = StorageTypes[this.provider.originalData.storageProviderType.name];
  //   const localizationKey = `StorageModule::ProvidersOptions:Keys:${type}:${setting.key}`;
  //   const localizedKey = this.localizationService.instant(localizationKey);
  //   return localizedKey;
  // }

  validateProvider(): boolean {
    let errors: string[] = [];
    if (!this.provider.name?.length) {
      this.provider.validators.nameEmpty = true;
      errors.push('StorageModule::ProvidersOptions:Error:NameEmpty');
    }
    if (errors.length === 0) return true;
    for (const err of errors) {
      this.error(err);
    }
    return false;
  }

  testStorageProvider(): void {
    const valid = this.validateProvider();
    if (!valid) return;
    this.provider.tests.waitingForTest = true;
    this.loading = true;
    this.storageProvidersTestService
      .testStorageProviderByProvider({
        id: this.provider.originalData?.id,
        name: this.provider.name,
        settings: this.settings,
        isActive: true,
        isTested: false,
        storageProviderTypeName:
          this.provider.originalData?.storageProviderTypeName,
      })
      .pipe(
        finalize(() => {
          this.provider.tests.waitingForTest = false;
          this.loading = false;
        })
      )
      .subscribe(
        (valid) => {
          this.provider.tests.testPassed = valid;
          this.provider.tests.testFailed = !valid;
        },
        (error) => {
          this.provider.tests.testPassed = false;
          this.provider.tests.testFailed = true;
        }
      );
  }

  async saveStorageProvider(): Promise<void> {
    const valid = this.validateProvider();
    if (!valid) return;
    this.provider.tests.waitingForTest = true;
    const providerDto: StorageProviderDto = {
      id: this.provider.originalData?.id,
      name: this.provider.name,
      fullType: '',
      settings: this.settings,
      isActive: this.provider.originalData?.isActive,
      isTested: false,
      storageProviderTypeName:
        this.provider.originalData?.storageProviderTypeName,
    };

    this.provider.tests.waitingForTest = true;

    try {
      this.loading = true;
      const savedProvider = await this.storageProvidersService
        .saveStorageProviderByProvider(providerDto)
        .toPromise();
      const id = savedProvider.id;
      if (id?.length > 0) {
        this.success('StorageModule::ProvidersOptions:SaveSuccess');
        this.state.setNotDirty();
      } else {
        this.error('StorageModule::ProvidersOptions:SaveFail');
      }
      this.state.setNotDirty();

      if (id.length > 0 && savedProvider.isTested) {
        this.editMode = false;
      }

      this.provider.tests.testPassed = savedProvider.isTested;
      this.provider.tests.testFailed = !savedProvider.isTested;
    } catch (error) {
      this.error('StorageModule::ProvidersOptions:SaveError');
    } finally {
      this.loading = false;
      this.provider.tests.waitingForTest = false;
    }

    if (!this.editMode) {
      this.reload();
    }
  }

  error(msg: string) {
    this.messageService.error(msg);
  }
  success(msg: string) {
    this.messageService.success(msg);
  }

  cancelEditing() {
    if (this.state.isDirty) {
      this.confirmationService.confirm(
        'Infrastructure::ConfirmLeavingDirty',
        () => {
          this.state.setNotDirty();
          this.editMode = false;
          this.reloadStorageProvider(this.provider.originalData.id);
        }
      );
    } else {
      this.editMode = false;
      this.reloadStorageProvider(this.provider.originalData.id);
    }
  }

  deleteStorageProvider() {
    this.confirmationService.confirm('StorageModule::ConfirmDelete', () => {
      this.loading = true;
      this.storageProvidersService
        .removeStorageProviderByStorageProviderId(this.provider.originalData.id)
        .subscribe({
          next: (wasSaved) => {
            this.loading = false;
            if (wasSaved) {
              this.state.setNotDirty();
              this.router.navigate(['/storage/providers-options']);
              this.messageService.success(
                'StorageModule::ProvidersOptions:RemoveSuccess'
              );
            } else {
              this.messageService.error(
                'StorageModule::ProvidersOptions:RemoveFail'
              );
            }
          },
          error: () => {
            this.messageService.error(
              'StorageModule::ProvidersOptions:RemoveError'
            );
          },
        });
    });
  }

  reload() {
    this.loadPossibleSettings();
    this.reloadStorageProvider(this.provider?.originalData?.id);
  }
  exploreStorageProvider(): void {
    if (!this.provider?.originalData?.id) {
      return;
    }

    this.fileExplorerDialogService.openExplorer(
      this.provider?.originalData?.id,
      true
    );
  }

  getIsActiveText(isActive: boolean | undefined): string {
    if (isActive === undefined || isActive === null) {
      return '-';
    }
    return this.localizationService.instant(
      isActive ? 'Infrastructure::Yes' : 'Infrastructure::No'
    );
  }

  async copyId(id: string) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
