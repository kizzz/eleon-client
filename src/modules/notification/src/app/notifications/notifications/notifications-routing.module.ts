import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotificationsDashboardComponent } from "./notifications-dashboard/notifications-dashboard.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "dashboard",
  },
  {
    path: "dashboard",
    component: NotificationsDashboardComponent,
    data:{
      name:"NotificatorModule::NotificationsDashboard:Title"
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
