import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TenantSettingsRoutingModule } from "./tenant-settings-routing.module";
import { SettingsManagementComponent } from "./settings-management/settings-management.component";
import { InputTextModule } from "primeng/inputtext";
// import { EmailSettingsComponent } from "./email-settings/email-settings.component";
import { TabsModule } from "primeng/tabs";
import { InputNumberModule } from "primeng/inputnumber";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { IdentitySettingsComponent } from "./identity-settings/identity-settings.component";
import { TooltipModule } from "primeng/tooltip";
import { TimeZoneSettingsComponent } from "./time-zone-settings/time-zone-settings.component";
import { SelectModule } from "primeng/select";
import { AppearanceSettingsComponent } from "./appearance-settings/appearance-settings.component";
import { FileUploadModule } from "primeng/fileupload";
import { ThemeElementSettingsComponent } from './appearance-settings/theme-element-settings/theme-element-settings.component';
import { SharedModule } from "@eleon/angular-sdk.lib";
import { RequiredMarkModule } from "@eleon/angular-sdk.lib";
import { PageTitleModule, TextSelectionModule } from "@eleon/primeng-ui.lib";
import { PasswordModule } from 'primeng/password';
import { DialogModule } from "primeng/dialog";
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { ResponsiveTableModule, SharedTableModule } from '@eleon/primeng-ui.lib'
import { TableModule } from 'primeng/table'
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast'
import { OrganizationChartModule } from 'primeng/organizationchart'
import { MessageModule } from 'primeng/message'
import { ListboxModule } from 'primeng/listbox'
import { GeneralTenantSettingsComponent } from './general-settings/general-settings.component';
import { TelemetrySettingsComponent } from './telemetry-settings/telemetry-settings.component';
import { CurrencyManagementModule } from '../currency-management/currency-management.module'
import { RawEditorModule } from '@eleon/primeng-ui.lib'
import { ToggleSwitchModule } from 'primeng/toggleswitch'
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [
    SettingsManagementComponent,
    IdentitySettingsComponent,
    TimeZoneSettingsComponent,
    AppearanceSettingsComponent,
    ThemeElementSettingsComponent,
		GeneralTenantSettingsComponent,
		TelemetrySettingsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TenantSettingsRoutingModule,
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
		CurrencyManagementModule,
    RawEditorModule,
    AutoCompleteModule
  ],
})
export class TenantSettingsModule {}
