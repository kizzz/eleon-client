import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CurrencyDashboardComponent } from "./currency-dashboard/currency-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: CurrencyDashboardComponent,
    data: {
      policyKey: "Settings",
      name: "TenantManagement::Currency:BreadcrumbName",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyManagementRoutingModule {}
