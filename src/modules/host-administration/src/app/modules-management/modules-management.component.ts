import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import {
  ClientApplicationDto,
  ClientApplicationFrameworkType,
  ClientApplicationService,
  ClientApplicationStyleType,
  ClientApplicationType,
  UiModuleService,
  EleoncoreModuleDto,
  FullClientApplicationDto,
  ModuleType,
  moduleTypeOptions,
  ClientAutodetectService,
  ServersideAutodetectService,
  MicroserviceService,
  ResourceService,
  ServiceHealthStatus,
} from '@eleon/sites-management-proxy';
import {
  PipesModule,
  RequiredMarkModule,
  SharedModule,
} from '@eleon/angular-sdk.lib';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { loadRemoteModule, setRemoteDefinitions } from '@nx/angular/mf';
import { TableModule } from 'primeng/table';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from '@eleon/primeng-ui.lib';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';

@Component({
  selector: 'app-modules-management',
  standalone: true,
  imports: [
    SharedModule,
    ButtonModule,
    RequiredMarkModule,
    TableModule,
    DialogModule,
    TabsModule,
    ProgressBarModule,
    InputGroupAddonModule,
    PipesModule,
    RadioButtonModule,
    PageTitleModule,
    InputGroupModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    TooltipModule,
    FormsModule,
    ResponsiveTableModule,
  ],
  templateUrl: './modules-management.component.html',
  styleUrl: './modules-management.component.css',
})
export class ModulesManagementComponent implements OnInit {
  loading = true;
  modules: EleoncoreModuleDto[] = [];

  newModule: EleoncoreModuleDto = {} as EleoncoreModuleDto;

  displayDiscoverDialog = false;
  displaySettingsDialog = false;

  loadLevels = [
    { label: 'Root', value: '1' },
    { label: 'SubModule', value: '2' },
  ];
  nameEmpty = false;
  pathEmpty = false;

  selectedModule: EleoncoreModuleDto = null;
  // @PageControls()
  // controls = contributeControls([
  //   {
  //     key: "TenantManagement::Add",
  //     icon: "fa fa-plus",
  //     severity: "info",
  //     loading: () => this.loading,
  //     disabled: () => this.loading,
  //     show: () => true,
  //     action: () => this.add(),
  //   },
  // ]);

  constructor(
    private uiModuleService: UiModuleService,
    private confirmationService: LocalizedConfirmationService,
    private messageService: MessageService,
    private localizationService: ILocalizationService
  ) {}

  ngOnInit(): void {
    this.loadModules();
    this.resetNewModule();
  }

  loadModules() {
    this.uiModuleService.getAll().subscribe((result) => {
      result = result.filter((r) => !r.isHidden);
      this.modules = result;
      this.loading = false;
    });
  }

  add() {
    this.resetNewModule();
    this.displayDiscoverDialog = true;
  }

  formatLoadLevel(loadLevel: string) {
    return this.loadLevels.find((result) => result.value == loadLevel)?.label;
  }

  resetNewModule() {
    this.newModule = {
      isEnabled: true,
      type: ModuleType.Client,
      isHealthCheckEnabled: false,
      healthCheckStatus: ServiceHealthStatus.Unknown,
      source: '',
      isDefault: false,
      isSystem: false,
      isHidden: false,
    };
  }

  resetValidators() {
    this.nameEmpty = false;
    this.pathEmpty = false;
  }

  async create() {
    if (this.validate(this.newModule)) {
      await this.uiModuleService.create(this.newModule).toPromise();
      this.resetNewModule();
      this.displayDiscoverDialog = false;
      this.loadModules();
    }
  }

  clear() {
    this.resetNewModule();
    this.resetValidators();
  }

  editSettings(module: EleoncoreModuleDto) {
    this.selectedModule = JSON.parse(JSON.stringify(module));
    if (
      this.selectedModule?.path?.length > 0 &&
      this.selectedModule?.path.startsWith('/modules/')
    ) {
      this.selectedModule.path = this.selectedModule.path.replace(
        '/modules/',
        ''
      );
    }
    this.displaySettingsDialog = true;
  }

  validate(module) {
    if (module.displayName) {
      module.displayName = module.displayName.trim();
    }
    if (module.path) {
      module.path = module.path.trim();
    }

    let isValid = true;
    if (!module.displayName?.length) {
      this.nameEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsEmpty'
        ),
      });
      isValid = false;
    }
    if (
      !!module.displayName?.length &&
      this.modules?.find(
        (m) =>
          m.displayName?.toLowerCase() == module.displayName?.toLowerCase() &&
          m.id != module?.id
      )
    ) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsNotUnique'
        ),
      });
      this.nameEmpty = true;
      isValid = false;
    }

    if (!module.path?.length) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:PathIsEmpty'
        ),
      });
      isValid = false;
    }

    let newPath = module.path;
    if (module.path?.length > 0) {
      newPath = '/modules/' + module.path;
    }
    if (
      !!module.path?.length &&
      this.modules?.find(
        (m) =>
          m.path?.toLowerCase() == newPath?.toLowerCase() && m.id != module?.id
      )
    ) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:PathIsNotUnique'
        ),
      });
      isValid = false;
    }

    if (!isValid) {
      return isValid;
    }

    this.newModule.path = newPath;

    return isValid;
  }

  edit() {
    if (this.selectedModule) {
      if (this.validate(this.selectedModule)) {
        if (
          this.selectedModule?.path?.length > 0 &&
          this.selectedModule?.path.startsWith('/modules/') == false
        ) {
          this.selectedModule.path = '/modules/' + this.selectedModule.path;
        }
        this.uiModuleService
          .update(this.selectedModule?.id, this.selectedModule)
          .subscribe((result) => {
            this.selectedModule = null;
            this.displaySettingsDialog = false;
            this.loadModules();
          });
      }
    }
  }

  delete(module: EleoncoreModuleDto) {
    this.confirmationService.confirm(
      'TenantManagement::Module:DeleteConfirmation',
      () => {
        this.uiModuleService.delete(module.id).subscribe((result) => {
          this.loadModules();
        });
      }
    );
  }
}
