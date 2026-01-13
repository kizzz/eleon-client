import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from "@angular/core";
import { NotificationSourceType } from '@eleon/notificator-proxy';
import { UserNotificationSettingsService } from '@eleon/notificator-proxy';
import { UserNotificationSettingsDto } from '@eleon/notificator-proxy';

interface Settings {
  title: string;
  data: UserNotificationSettingsDto;
}

@Component({
  standalone: false,
  selector: "app-notification-settings",
  templateUrl: "./notification-settings.component.html",
  styleUrls: ["./notification-settings.component.scss"],
})
export class NotificationSettingsComponent implements OnInit {
  settings: Settings[];
  loading: boolean = false;
  loadingSettings: boolean = false;

  constructor(
    private localizationService: ILocalizationService,
    private userNotificationSettingsService: UserNotificationSettingsService
  ) {}

  ngOnInit(): void {
    this.userNotificationSettingsService
      .getUserNotificationSettings()
      .subscribe((settings) => {
        this.settings = settings.map((x) => ({
          title: this.localizationService.instant(
            "NotificatorModule::NotificationSourceType:" +
              NotificationSourceType[x.sourceType]
          ),
          data: x,
        }));
      });
  }
}
