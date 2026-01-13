import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { RequiredMarkModule, SharedModule } from "@eleon/angular-sdk.lib"
import { PageTitleModule } from "@eleon/primeng-ui.lib"
import { ResponsiveTableModule, TableCellsModule } from "@eleon/primeng-ui.lib"
import { ProfilePictureModule } from "@eleon/primeng-ui.lib"
import { UserSessionsModule } from "@eleon/user-sessions.lib"
import { BadgeModule } from "primeng/badge"
import { ButtonModule } from "primeng/button"
import { CheckboxModule } from "primeng/checkbox"
import { DialogModule } from "primeng/dialog"
import { SelectModule } from "primeng/select"
import { FileUploadModule } from "primeng/fileupload"
import { InputMaskModule } from "primeng/inputmask"
import { InputTextModule } from "primeng/inputtext"
import { MessageModule } from "primeng/message"
import { PasswordModule } from 'primeng/password'
import { RadioButtonModule } from 'primeng/radiobutton'
import { SplitButtonModule } from 'primeng/splitbutton'
import { TableModule } from "primeng/table"
import { TabsModule } from "primeng/tabs"
import { TagModule } from 'primeng/tag'
import { TooltipModule } from "primeng/tooltip"
import { TreeModule } from "primeng/tree"
import { IdentityUserExtendedComponent } from "./identity-user-extended/identity-user-extended.component"
import { PermissionManagementComponent } from "./permission-management/permission-management.component"
import { RoleCreateDialogComponent } from "./role-create-dialog/role-create-dialog.component"
import { RoleDashboardComponent } from "./role-dashboard/role-dashboard.component"
import { RoleDetailsDialogComponent } from "./role-details-dialog/role-details-dialog.component"
import { RoleOrgUnitsManagementComponent } from "./role-org-units-management/role-org-units-management.component"
import { RoleUsersManagementComponent } from "./role-users-management/role-users-management.component"
import { UserCreateFromFileComponent } from "./user-dashboard/user-create-from-file/user-create-from-file.component"
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component"
import { UserDetailsDialogComponent } from './user-details/user-details-dialog/user-details-dialog.component'
import { UserSettingBoxComponent } from './user-details/user-setting-box/user-setting-box.component'
import { UserIsolationSettingsComponent } from "./user-isolation-settings/user-isolation-settings.component"
import { UserLoginSettingsComponent } from "./user-login-settings/user-login-settings.component"
import { UserOrgUnitsManagementComponent } from "./user-org-units-management/user-org-units-management.component"
import { UserOtpSettingsComponent } from "./user-otp-settings/user-otp-settings.component"
import { UserRolesManagementComponent } from "./user-roles-management/user-roles-management.component"
import { UserSessionManagementComponent } from './user-session-management/user-session-management.component'
import { TreeTableModule } from 'primeng/treetable';
import { HttpClientModule, provideHttpClient } from '@angular/common/http'
import { UsersNotificationSettingsComponent } from './user-details/users-notification-settings/users-notification-settings.component';

@NgModule({
  declarations: [
    IdentityUserExtendedComponent,
    UserIsolationSettingsComponent,
    UserLoginSettingsComponent,
    UserOtpSettingsComponent,
    PermissionManagementComponent,
    RoleUsersManagementComponent,
    UserRolesManagementComponent,
    UserOrgUnitsManagementComponent,
    
    RoleOrgUnitsManagementComponent,
    UserDetailsDialogComponent,
    UsersNotificationSettingsComponent,
    UserSettingBoxComponent,
    RoleDashboardComponent,
    RoleCreateDialogComponent,
    RoleDetailsDialogComponent,
    UserDashboardComponent,
    UserSessionManagementComponent
  ],
  imports: [
		UserCreateFromFileComponent,
    CommonModule,
    ButtonModule,
    InputTextModule,
    SharedModule,
    TableModule,
    FormsModule,
    PageTitleModule,
    FileUploadModule,
		HttpClientModule,
    BadgeModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    MessageModule,
    CheckboxModule,
    TabsModule,
    InputMaskModule,
    RequiredMarkModule,
    TreeModule,
    ResponsiveTableModule,
    TableCellsModule,
    PasswordModule,
    ProfilePictureModule,
    SplitButtonModule,
    TagModule,
    RadioButtonModule,
    UserSessionsModule,
    TreeTableModule,
    RouterModule.forChild([
      {
        path: 'roles',
        pathMatch: 'full',
        component: RoleDashboardComponent,
        data:{
          name:"TenantManagement::Roles",
          parentNames:"Infrastructure::Identities",
          mainParentName: "AbpUiNavigation::Menu:Administration",
        }
      },
      {
        path: 'users',
        pathMatch: 'full',
        component: UserDashboardComponent,
        data:{
          name:"TenantManagement::Users",
          parentNames:"Infrastructure::Identities",
          mainParentName: "AbpUiNavigation::Menu:Administration",
        }
      }
    ]),
  ],
  exports: [IdentityUserExtendedComponent, UserSettingBoxComponent, PermissionManagementComponent],
})
export class IdentityExtendedModule {}
