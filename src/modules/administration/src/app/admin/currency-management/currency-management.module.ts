import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { TabsModule } from "primeng/tabs";
import { InputNumberModule } from "primeng/inputnumber";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { TooltipModule } from "primeng/tooltip";
import { SelectModule } from "primeng/select";
import { FileUploadModule } from "primeng/fileupload";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { RequiredMarkModule } from "@eleon/angular-sdk.lib";
import { PageTitleModule } from "@eleon/primeng-ui.lib";
import { PasswordModule } from 'primeng/password';
import { DialogModule } from "primeng/dialog";
import { TextareaModule } from 'primeng/textarea';
import { ResponsiveTableModule, SharedTableModule, TextSelectionModule } from '@eleon/primeng-ui.lib'
import { TableModule } from 'primeng/table'
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast'
import { OrganizationChartModule } from 'primeng/organizationchart'
import { MessageModule } from 'primeng/message'
import { ListboxModule } from 'primeng/listbox'
import { CurrencyDashboardComponent } from './currency-dashboard/currency-dashboard.component';
import { CurrencyManagementRoutingModule } from "./currency-management-routing.module";
import { DatePickerModule } from 'primeng/datepicker';

@NgModule({
  declarations: [
    CurrencyDashboardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CurrencyManagementRoutingModule,
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
		DatePickerModule,
  ],
	exports:[
		CurrencyDashboardComponent
	]
})
export class CurrencyManagementModule {}
