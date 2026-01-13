
import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { finalize, firstValueFrom } from "rxjs";
import { UserIsolationSettingsComponent } from "../user-isolation-settings/user-isolation-settings.component";
import { UserOtpSettingsComponent } from "../user-otp-settings/user-otp-settings.component";

@Component({
  standalone: false,
  selector: "app-user-login-settings",
  templateUrl: "./user-login-settings.component.html",
  styleUrls: ["./user-login-settings.component.scss"],
})
export class UserLoginSettingsComponent {
  @ViewChild(UserIsolationSettingsComponent)
  userIsolationSettingsComponent: UserIsolationSettingsComponent;

  @ViewChild(UserOtpSettingsComponent)
  userOtpSettingsComponent: UserOtpSettingsComponent;

  public loading = false;
  public currentTabIx = 0;

  @Input()
  user: IdentityUserDto;

  @Input()
  public showDialog = false;
  @Output()
  public showDialogChange = new EventEmitter<boolean>();

  constructor() {}

  public show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(this.showDialog);
  }

  public async save(): Promise<void> {
    this.loading = true;
    let success = false;
    try {
      const components = [
        this.userIsolationSettingsComponent,
        this.userOtpSettingsComponent,
      ];

      for (let i = 0; i < components.length; i++) {
        const saveResult = await firstValueFrom(components[i].save());
        if (!saveResult) {
          this.currentTabIx = i;
          return;
        }
      }

      success = true;
    } finally {
      this.loading = false;
      if (success) {
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
      }
    }
  }

  public cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(this.showDialog);
  }
}
