import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UserNotificationSettingsService } from '@eleon/notificator-proxy';
import { UserNotificationSettingsDto } from '@eleon/notificator-proxy';
import { finalize } from "rxjs";

@Component({
  standalone: false,
  selector: "app-notification-type-settings",
  templateUrl: "./notification-type-settings.component.html",
  styleUrls: ["./notification-type-settings.component.scss"],
})
export class NotificationTypeSettingsComponent {
  @Input()
  settings: UserNotificationSettingsDto;

  @Input()
  loading: boolean;
  @Output()
  loadingChange = new EventEmitter<boolean>();

  constructor(
    private userNotificationSettingsService: UserNotificationSettingsService
  ) {}

  public setSendNative(value: boolean): void {
    this.setLoading(true);
    this.userNotificationSettingsService
      .setUserNotificationSettingsBySourceTypeAndSendNativeAndSendEmail(
        this.settings.sourceType,
        value,
        this.settings.sendEmail
      )
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe(() => {
        this.settings.sendNative = value;
      });
  }

  public setSendEmail(value: boolean): void {
    this.setLoading(true);
    this.userNotificationSettingsService
      .setUserNotificationSettingsBySourceTypeAndSendNativeAndSendEmail(
        this.settings.sourceType,
        this.settings.sendNative,
        value
      )
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe(() => {
        this.settings.sendEmail = value;
      });
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    this.loadingChange.emit(value);
  }
}
