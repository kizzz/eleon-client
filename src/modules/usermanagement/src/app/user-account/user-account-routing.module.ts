import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { UserAccountSettingsComponent } from "./user-account-settings/user-account-settings.component"
import { UserSessionsComponent } from '@eleon/user-sessions.lib'

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "profile",
  },
  {
    path: "profile",
    component: UserAccountSettingsComponent,
    data: {
      name: "Infrastructure::MyAccount",
      tab: "profile",
    },
  },
  {
    path: "sessions",
    component: UserSessionsComponent,
    data: {
      name: "Infrastructure::Sessions",
      tab: "sessions",
      // parentNames: 'Infrastructure::Sessions',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAccountRoutingModule {}
