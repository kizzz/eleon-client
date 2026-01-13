import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
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
  ApplicationType,
  MenuType,
} from '@eleon/sites-management-proxy';
import { DomainSettingsService } from '@eleon/tenant-management-proxy';
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
import { first, forkJoin, of, finalize, Subscription } from 'rxjs';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import {
  PageControls,
  contributeControls,
  PAGE_CONTROLS,
} from "@eleon/primeng-ui.lib";
import { ApplicationMenuItemManagementComponent } from '../../application-menu-item-management/application-menu-item-management.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulesManagementComponent } from '../../modules-management/modules-management.component';
import { ResourceManagementComponent } from '../../resource-management/resource-management.component';
import { MultiTenancyManagementComponent } from '../../multi-tenancy-management/multi-tenancy-management.component'
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from "primeng/textarea";
import { ModulesSettingsComponent } from '../../application-settings/modules-settings.component';
import { GeneralSettingsComponent } from '../../application-settings/general-settings.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AddModuleAutodetectComponent } from '../../application-settings/add-module-autodetect/add-module-autodetect.component';
import { PwaSettingsComponent } from '../../application-settings/pwa-settings.component';
import { ServiceWorkerSettingsComponent } from '../../application-settings/service-worker-settings.component';
import { TreeModule } from 'primeng/tree';
import { OnChanges } from '@angular/core';
import { TenantHostnameDto } from '@eleon/tenant-management-proxy';
import { SimpleChanges } from '@angular/core';
import { LocalizedConfirmationService, LocalizedMessageService } from '@eleon/primeng-ui.lib'

@Component({
  selector: 'app-application-domains-settings',
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
    PageTitleModule,
    InputGroupModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    TooltipModule,
    FormsModule,
    ResponsiveTableModule,
    CheckboxModule,
    TextareaModule,
		TreeModule,
  ],
  templateUrl: './application-domains-settings.component.html',
  styleUrls: ['./application-domains-settings.component.css'],
})
export class ApplicationDomainsSettingsComponent implements OnInit, OnChanges {
	loading = false;
	domains: TenantHostnameDto[] = [];
	availableDomains: TenantHostnameDto[] = [];
	addDomainDialogVisible = false;

	@Input()
	application: TreeNode<FullClientApplicationDto>;

	@PageControls()
  controls = contributeControls([
    {
      key: "TenantManagement::AddDomain",
      icon: "fa fa-plus",
      severity: "info",
      loading: () => this.loading,
      disabled: () => this.loading,
      show: () => !!this.application?.data?.id,
      action: () => this.addDomainDialogVisible = true,
    }
  ]);
	
  constructor(
    private clientApplicationService: ClientApplicationService,
    private clientDetector: ClientAutodetectService,
    private confirmationService: LocalizedConfirmationService,
    private messageService: LocalizedMessageService,
    private localizationService: ILocalizationService,
    private resourceService: ResourceService,
    private cdr: ChangeDetectorRef,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
		private domainsService: DomainSettingsService,
  ) {}

  ngOnInit() {
    
  }

	ngOnChanges(changes: SimpleChanges) {
		if (changes['application'] && this.application) {
			this.loading = true;
			this.loadDomains();
		}

	}

  loadDomains() {
    if (!this.application) {
      this.domains = [];
			return;
    }

		this.domainsService.getHostnamesByApplication(null)
			.pipe(finalize(() => this.loading = false))
			.subscribe(domains => {
				this.availableDomains = domains;
			});

		this.domainsService.getHostnamesByApplication(this.application.data?.id)
			.pipe(finalize(() => this.loading = false))
			.subscribe(domains => {
				this.domains = domains;
			});
  }

	addApplicationDomain(domain: TenantHostnameDto){
		if (!domain?.id){
			return;
		}

		this.loading = true;
		this.domainsService.updateDomainApplication(domain.id, this.application.data?.id)
			.pipe(finalize(() => this.loading = false))
			.subscribe(() => {
				this.loadDomains();
			});
	}

	removeApplicationDomain(domain: TenantHostnameDto) {
		if (!domain?.id){
			return;
		}

		this.confirmationService.confirm("TenantManagement::ConfirmDeleteApplicationDomain", () => {
			this.loading = true;
			this.domainsService.updateDomainApplication(domain.id, null)
				.pipe(finalize(() => this.loading = false))
				.subscribe(() => {
					this.loadDomains();
				});
		})
	}
}