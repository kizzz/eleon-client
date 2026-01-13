import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LanguageListComponent } from "./language-list/language-list.component";
import { RouterModule, Routes } from "@angular/router";
import { LocalizationEntriesListComponent } from "./localization-entries-list/localization-entries-list.component";

const routes: Routes = [
  {
    path: "languages",
    component: LanguageListComponent,
    data: {
      name: "LanguageManagement::Menu:LanguageManagement",
      parentNames: "LanguageManagement::Menu:LanguageManagement"
    },
  },
  {
    path: "localization-entries",
    component: LocalizationEntriesListComponent,
    data: {
      name: "LanguageManagement::Menu:LocalizationEntries",
      parentNames: "LanguageManagement::Menu:LanguageManagement"
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LanguageManagementRoutingModule {}
