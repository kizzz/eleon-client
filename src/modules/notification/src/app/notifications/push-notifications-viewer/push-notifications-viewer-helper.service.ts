import { Injectable } from "@angular/core";
import { ReplaySubject, Subject } from "rxjs";
import { IAuthManager, IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { PushNotificationService } from '@eleon/notificator-proxy';
import { NotificationLogService, NotificationType } from '@eleon/notificator-proxy';
import { PushNotificationsHelperService } from '../notifications-service/push-notifications-helper.service';
import { ILocalizationService, NotificationLogDto } from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: "root",
})
export class PushNotificationsViewerHelperService {
  private notificationsSubject = new ReplaySubject<NotificationLogDto[]>();
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadNotifications: NotificationLogDto[];
  private notificationsLog: NotificationLogDto[];
  private notifications: NotificationLogDto[] = [];

  constructor(
    private notificationHelper: PushNotificationsHelperService,
    private pushNotificationService: PushNotificationService,
    private notificationLogService: NotificationLogService,
    private authService: IAuthManager,
    private localizationService: ILocalizationService,
		private config: IApplicationConfigurationManager
  ) {
    this.listenUnread();
  }

  private listenUnread(): void {
    this.notificationHelper.unreadNotifications$.subscribe((notifications) => {
      this.notifications = notifications;
      this.notificationsSubject.next(this.notifications);
    });
  }

  public ackLatest(): void {
    const latest = this.notifications[0];
    if (latest && !latest.isRead) {
      this.notificationHelper.ackNotification(this.notifications[0].id);
    }
  }

  public loadMore(pageSize: number): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

      this.pushNotificationService
        .getRecentNotifications({
          skipCount: this.notifications.length,
          maxResultCount: pageSize,
					applicationName: this.getApplicationName(),
        })
        .subscribe((x) => {
          this.notificationsLog = x;
          this.updateNotifications();
        });

    return true;
  }

	private getApplicationName(){
		return this.config.getAppConfig()?.applicationName;
	}

  private updateNotifications() {

    for (const log of this.notificationsLog) {
      const existing = this.notifications.find((x) => x .id === log.id);
      if (!existing) {
        this.notifications.push(log);
      }
    }


    this.notifications = this.notifications.sort((a, b) => {
        return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
      });
    

    this.notificationsSubject.next(this.notifications);
  }

  public localizeNotificationContent(notification: NotificationLogDto): string {
    if (!notification.isLocalizedData) {
      return notification.content;
    } else {
      const localizationParams = notification.dataParams?.split(';');
      if (!localizationParams) {
        return notification.content;
      } else {
        return this.localizationService.instant(notification.content, ...localizationParams);
      }
    }
  }
}
