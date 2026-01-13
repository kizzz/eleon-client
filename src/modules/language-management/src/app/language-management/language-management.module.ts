import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LanguageListComponent } from "./language-list/language-list.component";
import { LanguageManagementRoutingModule } from "./language-management-routing.module";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { PageTitleModule } from "@eleon/primeng-ui.lib";
import { ResponsiveTableModule, SharedTableModule } from "@eleon/primeng-ui.lib";
import { RadioButtonModule } from "primeng/radiobutton";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { LocalizationEntriesListComponent } from "./localization-entries-list/localization-entries-list.component";
import { SelectModule } from "primeng/select";
import { MultiSelectModule } from "primeng/multiselect";
// import { DialogModule } from "primeng/dialog";
import { TextareaModule } from "primeng/textarea";
import { InputTextModule } from "primeng/inputtext";
import { LocalizationEntryEditDialogComponent } from "./localization-entry-edit-dialog/localization-entry-edit-dialog.component";
import { TooltipModule } from "primeng/tooltip";
import { TableCellsModule } from "@eleon/primeng-ui.lib";
import { DialogModule } from "primeng/dialog";

@NgModule({
  declarations: [
    LanguageListComponent,
    LocalizationEntriesListComponent,
    LocalizationEntryEditDialogComponent,
  ],
  imports: [
    CommonModule,
    LanguageManagementRoutingModule,
    SharedModule,
    TableModule,
    ButtonModule,
    PageTitleModule,
    ResponsiveTableModule,
    RadioButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DialogModule,
    // DialogModule,
    TextareaModule,
    TooltipModule,
    TableCellsModule,
    SharedTableModule
  ],
})
export class LanguageManagementModule {}
