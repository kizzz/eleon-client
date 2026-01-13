import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import {
  ClientApplicationDto,
  ClientApplicationFrameworkType,
  ClientApplicationService,
  ClientApplicationStyleType,
  ClientApplicationType,
  UiModuleService,
  ApplicationModuleDto,
  FullClientApplicationDto,
  ModuleType,
  moduleTypeOptions,
  ClientAutodetectService,
  ServersideAutodetectService,
  MicroserviceService,
  ResourceService,
  ServiceHealthStatus,
  MenuType,
  ApplicationType,
  ErrorHandlingLevel,
} from '@eleon/sites-management-proxy';
import { PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { loadRemoteModule, setRemoteDefinitions } from '@nx/angular/mf';
import { Table, TableModule } from 'primeng/table';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { first, forkJoin, of, Subscription } from 'rxjs';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from "@eleon/primeng-ui.lib";
import { ApplicationMenuItemManagementComponent } from '../application-menu-item-management/application-menu-item-management.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulesManagementComponent } from '../modules-management/modules-management.component';
import { ResourceManagementComponent } from '../resource-management/resource-management.component';
import { MultiTenancyManagementComponent } from '../multi-tenancy-management/multi-tenancy-management.component'
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from "primeng/textarea";
import { ModulesSettingsComponent } from '../application-settings/modules-settings.component';
import { GeneralSettingsComponent } from '../application-settings/general-settings.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AddModuleAutodetectComponent } from '../application-settings/add-module-autodetect/add-module-autodetect.component';
import { PwaSettingsComponent } from '../application-settings/pwa-settings.component';
import { ServiceWorkerSettingsComponent } from '../application-settings/service-worker-settings.component';

@Component({
  selector: 'app-application-management',
  standalone: true,
  imports: [
    SharedModule,
    TreeTableModule,
    ButtonModule,
    RequiredMarkModule,
    TableModule,
    DialogModule,
    TabsModule,
    ProgressBarModule,
    InputGroupAddonModule,
    PipesModule,
    RadioButtonModule,
    AddModuleAutodetectComponent,
    PageTitleModule,
    InputGroupModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    TooltipModule,
    FormsModule,
    ResponsiveTableModule,
    ApplicationMenuItemManagementComponent,
    ModulesManagementComponent,
    ResourceManagementComponent,
    MultiTenancyManagementComponent,
    CheckboxModule,
    TextareaModule,
    ModulesSettingsComponent,
    GeneralSettingsComponent,
    PwaSettingsComponent,
    ServiceWorkerSettingsComponent,
  ],
  templateUrl: './application-management.component.html',
  styleUrls: ['./application-management.component.css'],
})
export class ApplicationManagementComponent implements OnInit {
  clients: TreeNode[] = [];
  selectedModules: ApplicationModuleDto[] = [];

  selectedNode: TreeNode;
  displayDialog: boolean = false;
  displayCreateDialog: boolean = false;
  displayImportDialog: boolean = false;
  moduleTypeOptions = moduleTypeOptions;
  @ViewChild('generalMenuItem') generalMenuItem: ApplicationMenuItemManagementComponent;
	@ViewChild('topMenuItem') topMenuItem: ApplicationMenuItemManagementComponent;
	@ViewChild('userMenuItem') userMenuItem: ApplicationMenuItemManagementComponent;
  
  @ViewChild('multiTenancyItem') multiTenancyManagement: MultiTenancyManagementComponent;
  
  @ViewChild('resourcesTable') resourcesTableRef: Table;
  @ViewChild('modulesTable') modulesTableRef: Table;
  @ViewChild('pwaSettings') pwaSettings: PwaSettingsComponent;
  @ViewChild('swSettings') swSettings: ServiceWorkerSettingsComponent;
  resourceSearchQueryText: string = '';
  moduleSearchQueryText: string = '';
  loadingInDialog= false;

  tooltip: string = '';
  loading = false;
  MenuType = MenuType;

  @ViewChild('modulesManagement') modulesManagementComponent: ModulesManagementComponent;
  @ViewChild('resourceManagement') resourceManagementComponent: ResourceManagementComponent;


  newApplication: ClientApplicationDto = {
    isAuthenticationRequired: false,
    name: '',
    isEnabled: true,
    frameworkType: ClientApplicationFrameworkType.Angular,
    styleType: ClientApplicationStyleType.PrimeNg,
    clientApplicationType: ClientApplicationType.Portal,
    path: '',
    source: '',
    icon: 'fa-regular fa-newspaper',
    isDefault: false,
    isSystem: false,
    errorHandlingLevel: ErrorHandlingLevel.Debug,
    properties: [],
    useDedicatedDatabase: false,
		orderIndex: 0,
		appType: ApplicationType.Application
  };
  newModules: ApplicationModuleDto[] = [];

  detectType: 'Autodetect' | 'Manual' = 'Autodetect';


  frameworkTypes = [
    { label: 'None', value: ClientApplicationFrameworkType.None },
    { label: 'Angular', value: ClientApplicationFrameworkType.Angular },
    { label: 'Custom Angular', value: ClientApplicationFrameworkType.CustomAngular },
    { label: 'React', value: ClientApplicationFrameworkType.React }
  ];

  styleTypes = [
    { label: 'PrimeNg', value: ClientApplicationStyleType.PrimeNg },
    { label: 'None', value: ClientApplicationStyleType.None },
    { label: 'SakaiNg', value: ClientApplicationStyleType.SakaiNg },
  ];

  applicationTypes = [
    { label: 'Portal', value: ClientApplicationType.Portal },
    { label: 'ShoppingCart', value: ClientApplicationType.ShoppingCart }
  ];

  proxyWebOptions = [
    { label: 'Proxy', value: 'Proxy' },
    { label: 'Web', value: 'Web' }
  ];

  proxies = [
    { label: 'Proxy 1', value: 'Proxy1' },
    { label: 'Proxy 2', value: 'Proxy2' }
  ];

  proxyWebType = 'Proxy';
  proxy = this.proxies[0].value;

  getLabelByValue(types: {label: string, value: any}[], _value: any) {
    return types.find(({value}) => value == _value)?.label;
  }
  getKeyByValue(types: {key: string, value: any}[], _value: any) {
    return types.find(({value}) => value == _value)?.key;
  }

  firstResourceRowIx: number = 0;
  firstModulesRowIx: number = 0;

  activeIndex: number = 0;

  @PageControls()
  controls = contributeControls([
    {
      key: "TenantManagement::AddApplication",
      icon: "fa fa-plus",
      severity: "info",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => this.activeIndex === 0,
      action: () => this.addApplication(),
    },
    {
      key: "TenantManagement::AddModule",
      icon: "fa fa-plus",
      severity: "info",
      loading: () => this.modulesManagementComponent?.loading,
      disabled: () => this.modulesManagementComponent?.loading,
      show: () => this.activeIndex === 1,
      action: () => this.modulesManagementComponent?.add(),
    },
    {
      key: "TenantManagement::AddResource",
      icon: "fa fa-plus",
      severity: "info",
      loading: () => this.resourceManagementComponent?.loading,
      disabled: () => this.resourceManagementComponent?.loading,
      show: () => this.activeIndex === 2,
      action: () => this.resourceManagementComponent?.add(),
    },
  ]);

  
  loadLevels = [
    { label: 'Root', value: "1" },
    { label: 'SubModule', value: "2" }
  ];
  nameEmpty = false;
  pathEmpty = false;

  constructor(
    private uiModuleService: UiModuleService,
    private clientApplicationService: ClientApplicationService,
    private clientDetector: ClientAutodetectService,
    private confirmationService: ConfirmationService,
    private microservice: MicroserviceService,
    private messageService: MessageService,
    private localizationService: ILocalizationService,
    private serversideDetector: ServersideAutodetectService,
    private resourceService: ResourceService,
    private cdr: ChangeDetectorRef,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
  ) {}

  ngOnInit() {
    const baseURI = document.baseURI; 
    const appsIndex = baseURI.indexOf('apps/');
    if (appsIndex !== -1) {
      this.tooltip = baseURI.substring(0, appsIndex + 5); 
    } else {
      this.tooltip = baseURI;
    }

    this.activatedRoute.data.subscribe((data) => {
      let type = data["type"];
      if (type) {
        if (type == "application-management") {
          this.activeIndex = 0;
        } else if (type == "modules-management") {
          this.activeIndex = 1;
        } else if (type == "resources-management") {
          this.activeIndex = 2;
        }
      }
    });

    this.loadApplications();
  }

  onChange({ index }: { index: number } ) {
    this.router.navigate(['sites/', {
      [0]: "application-management",
      [1]: "modules-management",
      [2]: "resources-management",
    }[index]]);
  }


  formatLoadLevel(loadLevel: string) {
    return this.loadLevels.find(result => result.value == loadLevel)?.label;
  }

  loadApplications() {
    this.loadingInDialog = true;
    this.clientApplicationService.getAll().subscribe((clients: FullClientApplicationDto[]) => {
      this.clients = clients.map(app => ({
        data: { ...app, nodeType: 'client-app' },
        expanded: true,
        children: app.modules.map(module => ({
          data: { ...module, nodeType: 'client-module' },
          expanded: true,
          children: [],
        })),
      }));
      this.clients = [...this.clients];
      this.loadingInDialog = false;
      this.cdr.detectChanges();
    });
  }

  addUimodule(application: FullClientApplicationDto) {
    const dialogRef = this.dialogService.open(AddModuleAutodetectComponent, {
      data: { applicationId: application.id, existingModules: application.modules },
      header: this.localizationService.instant('TenantManagement::AddModule'),
    });
    dialogRef.onClose.pipe(first())
    .subscribe(() => {
      this.loadApplications();
    })
  }


  addApplication() {
    this.displayCreateDialog = true;
  }

  getIcon(row) {
    if (row.nodeType === 'client-app' && row?.icon)
    {
      return row.icon;
    }
    else if (row.nodeType === 'client-module') {
      return row.type === ModuleType.Client ? 'fa-solid fa-puzzle-piece' : 'fa-solid fa-database';
    }

    return 'fa-regular fa-newspaper'
  }

  getType(row){
    if (row.nodeType === 'client-app')
    {
      return this.localizationService.instant("TenantManagement::Type:Application");
    }
    else if (row.nodeType === 'client-module') {
      return this.localizationService.instant(`TenantManagement::Type:Client`);
    }

    return this.localizationService.instant("TenantManagement::Type:Unknown");
  }

  createApplicationDialogClear(){
    this.resetValidators();
    this.newApplication = {
      name: '',
      isEnabled: true,
      isAuthenticationRequired: false,
      frameworkType: ClientApplicationFrameworkType.Angular,
      styleType: ClientApplicationStyleType.PrimeNg,
      clientApplicationType: ClientApplicationType.Portal,
      errorHandlingLevel: ErrorHandlingLevel.Debug,
      path: '',
      source: '',
      icon: 'fa-regular fa-newspaper',
      useDedicatedDatabase: false,
      isDefault: false,
      isSystem: false,
      properties: [],
			orderIndex: 0,
			appType: ApplicationType.Application
    };
  }

  cancelCreateApplication(){
    this.createApplicationDialogClear();
    this.displayCreateDialog = false;
  }

  createApplication() {
    if (this.newApplication.name){
      this.newApplication.name = this.newApplication.name.trim();
    }
    if (this.newApplication.path){
      this.newApplication.path = this.newApplication.path.trim();
    }

    let isValid = true;
    if (!this.newApplication.name.length) {
      this.nameEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:NameIsEmpty')
      });
      isValid = false;
    }
    if(!!this.newApplication?.name?.length &&
      this.clients?.find(m => m.data?.name?.toLowerCase() == this.newApplication.name?.toLowerCase())) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:NameIsNotUnique')
      });
      this.nameEmpty = true;
      isValid = false;
    }
    if(!this.newApplication?.path?.length) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:PathIsEmpty')
      });
      isValid = false;
    }
    
    let newPath = this.newApplication.path;
    if(this.newApplication?.path?.length && !this.newApplication.path.startsWith('/apps/')) {
      newPath = '/apps/' + this.newApplication.path;
    }

    if(!!this.newApplication?.path?.length &&
      this.clients?.find(m => m.data?.path?.toLowerCase() == newPath?.toLowerCase())) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:PathIsNotUnique')
      });
      isValid = false;
    }

    if(!isValid) return;

    this.newApplication.path = newPath;
  
    this.clientApplicationService.create(this.newApplication).subscribe((app: ClientApplicationDto) => {
      this.clients = [
        ...this.clients,
        {
          data: { ...app, nodeType: 'client-app' },
          expanded: true,
          children: [],
        }
      ];
      this.newApplication = {
        name: '',
        isEnabled: true,
        isAuthenticationRequired: false,
        frameworkType: ClientApplicationFrameworkType.Angular,
        styleType: ClientApplicationStyleType.PrimeNg,
        clientApplicationType: ClientApplicationType.Portal,
        errorHandlingLevel: ErrorHandlingLevel.Debug,
        path: '',
        source: '',
        useDedicatedDatabase: false,
        isDefault: false,
        isSystem: false,
        properties: [],
				orderIndex: 0,
				appType: ApplicationType.Application
      };
      this.displayCreateDialog = false;
    });
  }

  editClient(node: TreeNode) {
    this.selectedNode = structuredClone(node);
    if(this.selectedNode.data?.path?.length && this.selectedNode.data.path.startsWith('/apps/')) {
      this.selectedNode.data.path = this.selectedNode.data.path.replace('/apps/', '');
    }
    if(this.selectedNode.children.length > 0) {
      this.selectedModules = this.selectedNode.children.map(n => n.data);
    }


    this.displayDialog = true;
  }

  deleteClient(node: TreeNode) {
    this.confirmationService.confirm({
      message: this.localizationService.instant("TenantManagement::AreYouSureDelete"),
      accept: () => {
            if (node.data.nodeType == 'client-app') {
              this.clientApplicationService.delete(node.data.id).subscribe(result => {      
                if (node.parent) {
                  node.parent.children = node.parent.children.filter(n => n !== node);
                } else {
                  this.clients = this.clients.filter(n => n !== node);
                }
                this.clients = [...this.clients];
              });
              return;
            }
            // if (node.parent) {
            //   node.parent.children = node.parent.children.filter(n => n !== node);
            // } else {
            //   this.clients = this.clients.filter(n => n !== node);
            // }
            this.clientApplicationService.removeModuleFromApplicationByApplicationIdAndModuleId(node.parent.data?.id, node.data.id).subscribe(result => {
              this.loadApplications();
            });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::Cancel"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  saveSettings() {
    this.uiModuleService.update(this.selectedNode.data.id, this.selectedNode.data).subscribe(() => {
      this.displayDialog = false;
      this.loadApplications();
    });
  }

  resetValidators(){
    this.nameEmpty = false;
    this.pathEmpty = false;
  }

  cancelEditAppSettings = () => 
  {
    this.displayDialog = false;
  }

  saveAppSettings() {
    let isValid = true;
    if(!this.selectedNode.data.name?.length) {
      this.nameEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:NameIsEmpty')
      });
      isValid = false;
    }
    if(!!this.selectedNode.data?.name?.length &&
      this.clients?.find(m => m.data?.name?.toLowerCase() == this.selectedNode.data.name?.toLowerCase() && m.data.id != this.selectedNode.data.id)) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:NameIsNotUnique')
      });
      this.nameEmpty = true;
      isValid = false;
    }
    if(!this.selectedNode.data?.path?.length) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant('TenantManagement::Error:PathIsEmpty')
      });
      isValid = false;
    }
    
    const pwaSettingValidation = this.pwaSettings.validate();
    if (!pwaSettingValidation.valid) {
      for (let error of pwaSettingValidation.errors) {
        this.messageService.add({
          severity: 'error',
          summary: error,
        });
      }
      isValid = false;
    }
    const swSettingValidation = this.swSettings.validate();
    if (!swSettingValidation.valid) {
      for (let error of swSettingValidation.errors) {
        this.messageService.add({
          severity: 'error',
          summary: error,
        });
      }
      isValid = false;
    }
    

    if(!isValid) return;

    let appToUpdate = { ...this.selectedNode.data };
    
    if(appToUpdate?.path?.length && !appToUpdate?.path.startsWith('/apps/')) {
      appToUpdate.path = '/apps/' + appToUpdate.path;
    }
    forkJoin([
      this.clientApplicationService.update(this.selectedNode.data.id, appToUpdate),
      this.generalMenuItem.update(),
			this.topMenuItem.update(),
			this.userMenuItem.update(),
      this.multiTenancyManagement.update(),

      // this.select()
    ]).subscribe(() => {
      this.displayDialog = false;
      this.loadApplications();
    }, (err) => {
      console.log(err);
    });
  }

  isModule(data: ClientApplicationDto): boolean {
    return ![ ClientApplicationType.Portal,  ClientApplicationType.ShoppingCart].includes(data.clientApplicationType);
  }

  select(){
    if(!this.selectedModules?.length) return of();
    this.loadingInDialog = true;
    return this.clientApplicationService
      .addBulkModulesToApplicationByModules(this.selectedModules)
      .subscribe(result => {
      if(result){
        this.messageService.add({
          severity: 'success',
          summary: this.localizationService.instant('TenantManagement::ModulesAddedSuccessfully')
        });
      }
      else{
        this.messageService.add({
          severity: 'error',
          summary: this.localizationService.instant('TenantManagement::Error:ModulesNotAdded')
        });
      }
      this.displayImportDialog = false;
      this.loadApplications();
      this.loadingInDialog = false;
    })
  }

  navigateToApp(node: TreeNode){
    const path = node.data.path;
    window.open(path, "_blank");
  }
}