import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from '@angular/forms'
import { RequiredMarkModule, SharedModule } from '@eleon/angular-sdk.lib'
import { PageTitleModule } from '@eleon/primeng-ui.lib'
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib'
import { ButtonModule } from "primeng/button"
import { DatePickerModule } from "primeng/datepicker"
import { DialogModule } from "primeng/dialog"
import { SelectModule } from "primeng/select"
import { InputTextModule } from 'primeng/inputtext'
import { TableModule } from "primeng/table"
import { ChangePasswordFormComponent } from "./change-password-form/change-password-form.component"
import { ManageProfileStateService } from "./manage-profile.state.service"
import { UserAccountRoutingModule } from "./user-account-routing.module"
import { UserAccountSettingsComponent } from "./user-account-settings/user-account-settings.component"
import { UserAccountSettingBoxComponent } from "./user-account-settings/user-acount-setting-box/user-account-setting-box.component"
import { UserImagePickerComponent } from "./user-profile-picture-settings/user-image-picker/user-image-picker.component"
import { UserProfilePictureSettingsComponent } from "./user-profile-picture-settings/user-profile-picture-settings.component"
import { CheckboxModule } from 'primeng/checkbox'
import { NotificationSettingsBoxComponent } from './user-account-settings/notification-settings-box/notification-settings-box.component'
import { UserSessionsModule } from '@eleon/user-sessions.lib'
import { PanelModule } from 'primeng/panel'


@NgModule({
  declarations: [
    UserAccountSettingsComponent,
    ChangePasswordFormComponent,
    UserProfilePictureSettingsComponent,
    UserImagePickerComponent,
    UserAccountSettingBoxComponent,
		NotificationSettingsBoxComponent,
  ],
  imports: [
    CommonModule,
    UserAccountRoutingModule,
    SharedModule,
    PageTitleModule,
    TableModule,
    ResponsiveTableModule,
    DatePickerModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    RequiredMarkModule,
    InputTextModule,
		CheckboxModule,
    FormsModule,
    UserSessionsModule,
    PanelModule
  ],
  providers:[
    ManageProfileStateService
  ]
})
export class UserAccountModule {}
