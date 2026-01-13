import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { NotificationsDashboardComponent } from './notifications/notifications-dashboard/notifications-dashboard.component'

const routes: Routes = [
  {
    path: "dashboard",
    component: NotificationsDashboardComponent,
    data: {
      name: "NotificatorModule::Notifications",
      tab: "notifications",
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
