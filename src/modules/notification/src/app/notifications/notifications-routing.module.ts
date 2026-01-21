import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { NotificationsDashboardComponent } from './notifications/notifications-dashboard/notifications-dashboard.component'
import { EmailSettingsComponent } from './settings/email-settings/email-settings.component'

const routes: Routes = [
  {
    path: "dashboard",
    component: NotificationsDashboardComponent,
    data: {
      name: "NotificatorModule::Notifications",
      tab: "notifications",
    },
  },
  {
    path: "settings",
    component: EmailSettingsComponent,
    data: {
      name: 'TenantManagement::TenantSettings:Menu:NotificationSettings',
      parentNames: 'TenantManagement::TenantSettings:Menu:Top',
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
