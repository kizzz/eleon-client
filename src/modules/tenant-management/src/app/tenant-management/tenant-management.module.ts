import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TenantManagementDashboardComponent } from "./tenant-management-dashboard/tenant-management-dashboard.component";
import { RequiredMarkModule, SharedModule } from "@eleon/angular-sdk.lib";
import { OrganizationChartModule } from "primeng/organizationchart";
import { RouterModule } from "@angular/router";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { CanDeactivateDirtyGuard, RawEditorModule, ResponsiveTableModule, SharedTableModule, TextSelectionModule } from "@eleon/primeng-ui.lib";
import { TenantManagementCreateDialogComponent } from "./tenant-management-create-dialog/tenant-management-create-dialog.component";
import { MenuModule } from 'primeng/menu';
import { ToastModule } from "primeng/toast";
import { TenantManagementCreateBoxComponent } from "./tenant-management-create-box/tenant-management-create-box.component";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { CheckboxModule } from "primeng/checkbox";
import { CreateDatabaseDialogComponent } from "./create-database-dialog/create-database-dialog.component";
import { CreateSubDomainDialogComponent } from "./create-sub-domain-dialog/create-sub-domain-dialog.component";
import { MessageModule } from "primeng/message";
import { PageTitleModule } from "@eleon/primeng-ui.lib";
import { TenantExternalLoginSettingsBoxComponent } from "./tenant-settings/tenant-external-login-settings-box/tenant-external-login-settings-box.component";
import { TenantExternalLoginSettingsDialogComponent } from "./tenant-settings/tenant-external-login-settings-dialog/tenant-external-login-settings-dialog.component";
import { TenantExternalLoginProviderSettingsComponent } from "./tenant-settings/tenant-external-login-provider-settings/tenant-external-login-provider-settings.component";
import { TenantHostnameSettingsDialogComponent } from "./tenant-settings/tenant-hostname-settings-dialog/tenant-hostname-settings-dialog.component";
import { FileUploadModule } from "primeng/fileupload";
import { SelectModule } from "primeng/select";
import { TenantClientIsolationDialogComponent } from "./tenant-settings/tenant-client-isolation-dialog/tenant-client-isolation-dialog.component";
import { TenantIpIsolationDialogComponent } from "./tenant-settings/tenant-ip-isolation-dialog/tenant-ip-isolation-dialog.component";
import { TenantContentSecurityDialogComponent } from "./tenant-settings/tenant-content-security-dialog/tenant-content-security-dialog.component";
import { TenantFeatureSettingsDialogComponent } from "./tenant-settings/tenant-feature-settings-dialog/tenant-feature-settings-dialog.component";
import { ListboxModule } from "primeng/listbox";
import { TenantDomainsTableComponent } from './tenant-settings/tenant-domains/tenant-domains-table/tenant-domains-table.component'
import { SplitButtonModule } from "primeng/splitbutton";
import { TenantGeneralSettingsDialogComponent } from "./tenant-settings/tenant-general-settings-dialog/tenant-general-settings-dialog.component";
import { TenantDomainsComponent } from './tenant-settings/tenant-domains/tenant-domains.component'
import { InputNumberModule } from 'primeng/inputnumber'
import { TooltipModule } from 'primeng/tooltip'
import { TextareaModule } from 'primeng/textarea'
import { ChipModule } from 'primeng/chip'
import { AutoCompleteModule } from 'primeng/autocomplete'


@NgModule({
  declarations: [
    TenantManagementDashboardComponent,
    TenantManagementCreateDialogComponent,
    TenantManagementCreateBoxComponent,
    CreateDatabaseDialogComponent,
    CreateSubDomainDialogComponent,
    TenantExternalLoginSettingsBoxComponent,
    TenantExternalLoginSettingsDialogComponent,
    TenantExternalLoginProviderSettingsComponent,
    TenantHostnameSettingsDialogComponent,
    TenantClientIsolationDialogComponent,
    TenantIpIsolationDialogComponent,
    TenantContentSecurityDialogComponent,
    TenantFeatureSettingsDialogComponent,
    TenantGeneralSettingsDialogComponent,
    TenantDomainsComponent,
    TenantDomainsTableComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: "",
        pathMatch: "full",
        component: TenantManagementDashboardComponent,
        data: {
          name: "Infrastructure::TenantManagement",
          parentNames: "Infrastructure::Identities",
        },
      },
      {
        path: 'domains',
        component: TenantDomainsComponent,
        canDeactivate: [CanDeactivateDirtyGuard],
        data: {
          name: 'TenantManagement::TenantSettings:Menu:HostnameSettings',
          parentNames: 'TenantManagement::TenantSettings:Menu:Top',
          policyKey: 'Settings',
        },
      },
    ]),
    TextSelectionModule,
    TabsModule,
    ResponsiveTableModule,
    ButtonModule,
    TableModule,
    MenuModule,
    ToastModule,
    DialogModule,
    SplitButtonModule,
    SharedTableModule,
    PasswordModule,
    InputTextModule,
    CheckboxModule,
    OrganizationChartModule,
    MessageModule,
    PageTitleModule,
    FileUploadModule,
    SelectModule,
    ListboxModule,
    InputTextModule,
    RequiredMarkModule,
    TabsModule,
    InputNumberModule,
    ButtonModule,
    PageTitleModule,
    CheckboxModule,
    TooltipModule,
    SelectModule,
    FileUploadModule,
    PasswordModule,
    DialogModule,
    TextareaModule,
    ChipModule,
    TextSelectionModule,
    ResponsiveTableModule,
    TableModule,
    MenuModule,
    ToastModule,
    DialogModule,
    SharedTableModule,
    OrganizationChartModule,
    MessageModule,
    ListboxModule,
    RawEditorModule,
    AutoCompleteModule
  ],
})
export class TenantManagementModule {}
