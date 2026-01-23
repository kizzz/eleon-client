import { Component, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/internal/operators/first';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { MenuItem } from 'primeng/api';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { TenantManagementCreateDialogComponent } from '../tenant-management-create-dialog/tenant-management-create-dialog.component';
import { HostService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { Menu } from 'primeng/menu';
import { SplitButton } from 'primeng/splitbutton';
import { CreateDatabaseDialogComponent } from '../create-database-dialog/create-database-dialog.component';
import { IApplicationConfigurationManager, IImpersonationService } from '@eleon/angular-sdk.lib';
import { CreateSubDomainDialogComponent } from '../create-sub-domain-dialog/create-sub-domain-dialog.component';
import { TenantExternalLoginSettingsDialogComponent } from '../tenant-settings/tenant-external-login-settings-dialog/tenant-external-login-settings-dialog.component';
import { TenantHostnameSettingsDialogComponent } from '../tenant-settings/tenant-hostname-settings-dialog/tenant-hostname-settings-dialog.component';
import { TenantClientIsolationDialogComponent } from '../tenant-settings/tenant-client-isolation-dialog/tenant-client-isolation-dialog.component';
import { TenantIpIsolationDialogComponent } from '../tenant-settings/tenant-ip-isolation-dialog/tenant-ip-isolation-dialog.component';
import { TenantContentSecurityDialogComponent } from '../tenant-settings/tenant-content-security-dialog/tenant-content-security-dialog.component';
import { TenantFeatureSettingsDialogComponent } from '../tenant-settings/tenant-feature-settings-dialog/tenant-feature-settings-dialog.component';
import { TenantDto } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TenantService } from '@eleon/eleoncore-multi-tenancy-proxy';
import { TextInputComponent } from '@eleon/primeng-ui.lib';
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib';
import { TenantGeneralSettingsDialogComponent } from '../tenant-settings/tenant-general-settings-dialog/tenant-general-settings-dialog.component';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-tenant-management-dashboard',
  templateUrl: './tenant-management-dashboard.component.html',
  styleUrls: ['./tenant-management-dashboard.component.scss'],
})
export class TenantManagementDashboardComponent implements OnInit {
  @ViewChild('tenantCreateDialog')
  tenantCreateDialogRef: TenantManagementCreateDialogComponent;

  @ViewChild('editConnStringDialog')
  editConnStringDialogRef: TextInputComponent;
  currConnStr: string = null;

  filtered: TenantDto[] = [];
  tenants: TenantDto[];
  hostActionItems: MenuItem[];
  featuresMgmtVisible: boolean = false;
  hostTenant: TenantDto;
  searchQueryText: string = '';
  items: MenuItem[];
  private setConnectionItem: MenuItem;
  private applyMigrationsItem: MenuItem;

  selectedTenant?: TenantDto;
  loading = false;
  @ViewChild('createDatabaseDialog')
  createDatabaseDialogRef: CreateDatabaseDialogComponent;

  @ViewChild('createSubdomainDialog')
  createSubDomainDialogRef: CreateSubDomainDialogComponent;
  domainName: string;

  @ViewChild(TenantExternalLoginSettingsDialogComponent)
  tenantExternalLoginSettingsDialogRef: TenantExternalLoginSettingsDialogComponent;

  @ViewChild(TenantHostnameSettingsDialogComponent)
  tenantHostnameSettingsDialogRef: TenantHostnameSettingsDialogComponent;

  @ViewChild(TenantClientIsolationDialogComponent)
  tenantClientIsolationSettingsDialogRef: TenantClientIsolationDialogComponent;

  @ViewChild(TenantIpIsolationDialogComponent)
  tenantIpIsolationDialogComponentRef: TenantIpIsolationDialogComponent;

  @ViewChild(TenantContentSecurityDialogComponent)
  tenantContentSecurityDialogComponentRef: TenantContentSecurityDialogComponent;

  @ViewChild(TenantFeatureSettingsDialogComponent)
  tenantFeatureSettingsDialogComponentRef: TenantFeatureSettingsDialogComponent;

  @ViewChild(TenantGeneralSettingsDialogComponent)
  tenantGeneralSettingsDialogComponentRef: TenantGeneralSettingsDialogComponent;

  @ViewChild('menu')
  menu: Menu;

  @PageControls()
  controls = contributeControls([
    {
      key: 'Infrastructure::Tenant:HostSettings',
      action: () => this.onActionsClicked(event, this.menu, null),
      disabled: () => this.loading,
      show: () => !this.currentTenant,
      loading: () => this.loading,
      icon: 'fas fa-cog',
      severity: 'info',
    },
    {
      key: 'Infrastructure::TenantManagement:Header:Add',
      action: () => this.openCreateDialog(),
      disabled: () => this.loading,
      show: () => true,
      loading: () => this.loading,
      icon: 'fas fa-plus',
      severity: 'success',
    },
  ]);

  currentTenant: string = null;
  constructor(
    public tenantService: TenantService,
    public messageService: LocalizedMessageService,
    public hostService: HostService,
    public localizationService: ILocalizationService,
    public localizedConfirmationService: LocalizedConfirmationService,
    private impersonationService: IImpersonationService,
    private configStateService: IApplicationConfigurationManager
  ) {}

  ngOnInit(): void {
    this.currentTenant =
      this.configStateService.getAppConfig().currentUser?.tenantId;

    const commonItems: MenuItem[] = [
      // {
      //   label: this.localizationService.instant(
      //     "Infrastructure::TenantManagement:CreateDatabase"
      //   ),
      //   command: () => {
      //     this.createDatabase(this.selectedTenant);
      //   },
      // },
      {
        label: this.localizationService.instant(
          'Infrastructure::TenantManagement:ManageFeatures'
        ),
        command: () => {
          this.openTenantFeatureSettingsDialogComponent(
            this.selectedTenant?.id
          );
        },
      },
      // {
      //   label: this.localizationService.instant(
      //     "Infrastructure::TenantManagement:CreateSubdomain"
      //   ),
      //   command: () => {
      //     this.createSubDomain(this.selectedTenant);
      //   },
      // },
      {
        label: this.localizationService.instant(
          'Infrastructure::TenantManagement:ApplyMigrations'
        ),
        command: () => {
          this.applyMigrations();
        },
      },
      // {
      //   label: this.localizationService.instant(
      //     'TenantManagement::TenantSettings:ExternalLogin:Title'
      //   ),
      //   command: () => {
      //     this.openExternalLoginModal(this.selectedTenant?.id);
      //   },
      // },
      // {
      //   label: this.localizationService.instant(
      //     'TenantManagement::TenantSettings:HostnameSettings'
      //   ),
      //   command: () => {
      //     this.openHostnameSettingsModal(this.selectedTenant?.id);
      //   },
      // },
      // {
      //   label: this.localizationService.instant(
      //     "TenantManagement::TenantSettings:ClientIsolationSettings"
      //   ),
      //   command: () => {
      //     this.openClientIsolationSettingsModal(this.selectedTenant?.id);
      //   },
      // },
      // {
      //   label: this.localizationService.instant(
      //     'TenantManagement::TenantSettings:IpIsolationSettings'
      //   ),
      //   command: () => {
      //     this.openIpIsolationSettingsModal(this.selectedTenant?.id);
      //   },
      // },
      // {
      //   label: this.localizationService.instant(
      //     'TenantManagement::TenantSettings:ContentSecuritySettings'
      //   ),
      //   command: () => {
      //     this.openContentSecuritySettingsModal(this.selectedTenant?.id);
      //   },
      // },
    ];

    this.setConnectionItem = {
      label: this.localizationService.instant(
        'Infrastructure::TenantManagement:SetConnectionString'
      ),
      visible: false,
      command: () => {
        this.openEditConnStringDialog();
      },
    };

    this.applyMigrationsItem = {
      label: this.localizationService.instant(
        'Infrastructure::TenantManagement:ApplyMigrations'
      ),
      visible: false,
      command: () => {
        this.applyMigrations();
      },
    };

    this.items = [
      {
        label: this.localizationService.instant(
          'TenantManagement::TenantSettings:General'
        ),
        command: () => {
          this.tenantGeneralSettingsDialogComponentRef?.show(
            this.selectedTenant?.id
          );
        },
      },
      ...commonItems,
      this.setConnectionItem,
      this.applyMigrationsItem,
      {
        label: this.localizationService.instant(
          'TenantManagement::TenantSettings:Impersonate'
        ),
        command: () => {
          this.impersonateTenant(this.selectedTenant?.id);
        },
      },
      {
        label: this.localizationService.instant('Infrastructure::Delete'),
        command: () => {
          this.removeTenant();
        },
      },
    ];

    this.hostActionItems = [
      {
        label: this.localizationService.instant(
          'Infrastructure::TenantManagement:Actions'
        ),
        items: [...commonItems],
      },
    ];

    this.getDomainName();
  }

  onVisibleFeaturesChange = (value: boolean) => {
    this.featuresMgmtVisible = value;
  };

  loadTenants(searchQuery = null) {
    this.loading = true;
    this.tenantService
      .getCommonTenantList()
      .pipe(first())
      .subscribe((items) => {
        this.tenants = items;

        if (searchQuery) {
          this.filtered = items.filter((tenant) =>
            tenant.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          this.filtered = items;
        }
        this.loading = false;
      });
  }

  editTenant(event) {
    console.log(event);
  }

  applyMigrations() {
    this.localizedConfirmationService.confirm(
      'Infrastructure::TenantManagement:DatabaseMigrateConfirmation',
      () => {
        this.loading = true;
        this.hostService
          .migrate(this.selectedTenant?.id)
          .pipe(first())
          .subscribe(() => {
            this.messageService.success(
              'Infrastructure::TenantManagement:DatabaseMigratedSuccessfully'
            );
            this.loading = false;
          });
      },
      () => {
        return;
      }
    );
  }

  removeTenant() {
    this.loading = true;
    this.tenantService
      .delete(this.selectedTenant?.id)
      .pipe(first())
      .subscribe(() => {
        this.messageService.success(
          'Infrastructure::TenantManagement:TenantDeletedSuccessfully'
        );
        this.loading = false;
        this.loadTenants();
      });
  }

  onTenantSaved(): void {
    this.loading = true;
    setTimeout(() => {
      this.loadTenants();
    }, 1000);
  }

  openCreateDialog() {
    this.tenantCreateDialogRef.showDialog();
  }

  impersonateTenant(tenantId: string) {
    this.impersonationService.impersonate(null, tenantId);
  }

  openExternalLoginModal(tenantId: string): void {
    this.tenantExternalLoginSettingsDialogRef.tenantId = tenantId;
    this.tenantExternalLoginSettingsDialogRef.show();
  }

  openContentSecuritySettingsModal(tenantId: string): void {
    this.tenantContentSecurityDialogComponentRef.tenantId = tenantId;
    this.tenantContentSecurityDialogComponentRef.show();
  }

  openHostnameSettingsModal(tenantId: string): void {
    this.tenantHostnameSettingsDialogRef.tenantId = tenantId;
    this.tenantHostnameSettingsDialogRef.show();
  }

  openClientIsolationSettingsModal(tenantId: string): void {
    this.tenantClientIsolationSettingsDialogRef.tenantId = tenantId;
    this.tenantClientIsolationSettingsDialogRef.show();
  }

  openIpIsolationSettingsModal(tenantId: string): void {
    this.tenantIpIsolationDialogComponentRef.tenantId = tenantId;
    this.tenantIpIsolationDialogComponentRef.show();
  }

  openTenantFeatureSettingsDialogComponent(tenantId: string): void {
    this.tenantFeatureSettingsDialogComponentRef.show(tenantId);
  }

  openEditConnStringDialog() {
    this.tenantService
      .getDefaultConnectionString(this.selectedTenant?.id)
      .pipe(first())
      .subscribe((result) => {
        this.currConnStr = result;
        this.editConnStringDialogRef.showDialog();
      });

    this.editConnStringDialogRef.showDialog();
  }

  saveConnString(connString: string) {
    this.loading = true;
    this.tenantService
      .updateDefaultConnectionString(this.selectedTenant?.id, connString)
      .pipe(first())
      .subscribe(() => {
        this.loading = false;
      });
  }

  onActionsClicked(event, menuRef: Menu, tenant: TenantDto) {
    this.selectTenant(tenant);
    menuRef.toggle(event);
  }

  createDatabase(tenant: TenantDto) {
    if (this.currConnStr?.length > 0) {
      this.localizedConfirmationService.confirm(
        'Infrastructure::TenantManagement:ConnectionStringExists',
        () => {
          this.loading = true;
          this.createDatabaseDialogRef.tenant = tenant;
          this.createDatabaseDialogRef.connectionString = this.currConnStr;
          this.createDatabaseDialogRef.showDialog();
        },
        () => {
          return;
        }
      );
    } else {
      this.loading = true;
      this.createDatabaseDialogRef.tenant = tenant;
      this.createDatabaseDialogRef.connectionString = this.currConnStr;
      this.createDatabaseDialogRef.showDialog();
    }
  }

  closeDialog() {
    this.loading = false;
    this.loadTenants();
  }

  createSubDomain(tenant: TenantDto) {
    // this.loading = true;
    // this.createSubDomainDialogRef.tenant = tenant;
    // this.createSubDomainDialogRef.domainName = this.domainName;
    // this.createSubDomainDialogRef.showDialog();
  }

  getDomainName() {
    // this.loading = true;
    // this.vpTenantService.getDnsDomain()
    // .pipe(first())
    // .subscribe(result => {
    //   this.domainName = result;
    //   this.loading = false;
    // });
  }

  search(event) {
    this.loadTenants(this.searchQueryText);
  }

  clear(event) {
    this.searchQueryText = '';
    this.search(event);
  }

  selectTenant(tenant: TenantDto) {
    this.selectedTenant = tenant;
    this.updateTenantActionVisibility();
  }

  click(event: SplitButton, eventClick: MouseEvent): void {
    setTimeout(() => {
      event.onDropdownButtonClick(eventClick);
    }, 0);
  }

  private updateTenantActionVisibility() {
    if (!this.selectedTenant?.id) {
      this.setConnectionItem.visible = false;
      this.applyMigrationsItem.visible = false;
      return;
    }

    this.tenantService
      .getDefaultConnectionString(this.selectedTenant.id)
      .pipe(first())
      .subscribe((result) => {
        const hasConn = !!result;
        this.setConnectionItem.visible = hasConn;
        this.applyMigrationsItem.visible = hasConn;
        this.currConnStr = result;
      });
  }
}
