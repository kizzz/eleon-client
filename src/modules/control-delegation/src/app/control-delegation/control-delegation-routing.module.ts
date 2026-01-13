import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ControlDelegationByUserComponent } from "./control-delegation-by-user/control-delegation-by-user.component";
import { CanDeactivateDirtyGuard } from "@eleon/primeng-ui.lib";
import { ControlDelegationToUserComponent } from "./control-delegation-to-user/control-delegation-to-user.component";
import { ControlDelegationComponent } from "./control-delegation/control-delegation.component";
import { EcAuthGuard, PermissionGuard } from '@eleon/angular-sdk.lib';

const routes: Routes = [
  {
    path: "",
    component: ControlDelegationComponent,
    canActivate: [EcAuthGuard, PermissionGuard],
    canDeactivate: [CanDeactivateDirtyGuard],
    data: {
      name: "TenantManagement::ControlDelegation",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlDelegationRoutingModule {}
