import { Component, OnInit } from "@angular/core";
import { IProfileService } from '@eleon/angular-sdk.lib';
import { finalize } from "rxjs/operators";
import { ManageProfileStateService } from "../manage-profile.state.service";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";

@Component({
  standalone: false,
  selector: "app-change-password-form",
  templateUrl: "./change-password-form.component.html",
  styleUrls: ["./change-password-form.component.scss"],
})
export class ChangePasswordFormComponent implements OnInit {
  inProgress?: boolean;
  hideCurrentPassword?: boolean;
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
  currentPasswordIsInvalid: boolean = false;
  newPasswordIsInvalid: boolean = false;
  repeatPasswordIsInvalid: boolean = false;

  constructor(
    private profileService: IProfileService,
    private manageProfileState: ManageProfileStateService,
    private msgService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.hideCurrentPassword = !this.manageProfileState.getProfile()?.hasPassword;
  }
  

  private validate(): boolean {
    if (!this.currentPassword?.length || this.currentPassword.length === 0) {
      this.msgService.error("Infrastructure::MyProfile:ChangePassword:PasswordInvalid");
      this.currentPasswordIsInvalid = true;
    }
  
    if (!this.newPassword?.length|| this.newPassword.length === 0) {
      this.msgService.error("Infrastructure::MyProfile:ChangePassword:NewPasswordInvalid");
      this.newPasswordIsInvalid = true;
    }
  
    if (this.newPassword !== this.repeatNewPassword) {
      this.msgService.error("Infrastructure::MyProfile:ChangePassword:PasswordMismatch");
      this.repeatPasswordIsInvalid = true;
    } else if (this.currentPassword === this.newPassword) {
      this.msgService.error("Infrastructure::MyProfile:ChangePassword:PasswordIsSameAsNewPassword");
      this.currentPasswordIsInvalid = true;
      this.newPasswordIsInvalid = true;
    }
  
    return !this.currentPasswordIsInvalid && !this.newPasswordIsInvalid && !this.repeatPasswordIsInvalid;
  }

  onSubmit() {
    if (!this.validate()) return;

    this.inProgress = true;
    this.profileService
    .changePassword({
      ...(!this.hideCurrentPassword && {
        currentPassword: this.currentPassword,
      }),
      newPassword: this.newPassword,
    })
    .pipe(finalize(() => (this.inProgress = false)))
    .subscribe({
      next: () => {
        this.msgService.success("AbpAccount::PasswordChangedMessage");
        if (this.hideCurrentPassword) {
          this.hideCurrentPassword = false;
        }
      },
      error: (err) => {
        this.msgService.error(err);
      }
    });
  }

  resetValidators() {
    this.newPasswordIsInvalid = false;
    this.repeatPasswordIsInvalid = false;
    this.currentPasswordIsInvalid = false;
  }
}
