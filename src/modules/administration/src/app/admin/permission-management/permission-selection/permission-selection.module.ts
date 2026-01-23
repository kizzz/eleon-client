import { CommonModule } from "@angular/common"
import { NgModule } from '@angular/core'
import { PipesModule, RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, SharedTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { ButtonModule } from "primeng/button"
import { CheckboxModule } from 'primeng/checkbox'
import { DialogModule } from "primeng/dialog"
import { SelectModule } from "primeng/select"
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputNumberModule } from 'primeng/inputnumber'
import { ToggleSwitchModule } from "primeng/toggleswitch"
import { InputTextModule } from "primeng/inputtext"
import { TextareaModule } from "primeng/textarea"
import { MultiSelectModule } from "primeng/multiselect"
import { ProgressBarModule } from 'primeng/progressbar'
import { RadioButtonModule } from "primeng/radiobutton"
import { TableModule } from "primeng/table"
import { TooltipModule } from "primeng/tooltip"
import { TreeModule } from 'primeng/tree'
import { TreeTableModule } from 'primeng/treetable'
import { PermissionSelectionComponent } from "./permission-selection-dialog/permission-selection-dialog.component"

@NgModule({
  declarations: [
    PermissionSelectionComponent
  ],
  imports: [
    CommonModule,
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
    TextareaModule,
    TooltipModule,
    TableCellsModule,
    SharedTableModule,
    PipesModule,
    RequiredMarkModule,
    TreeTableModule,
    InputGroupAddonModule,
    InputGroupModule,
    ProgressBarModule,
    InputNumberModule,
    TreeModule,
    CheckboxModule
  ],
  exports: [PermissionSelectionComponent],
})
export class PermissionSelectionModule {}
