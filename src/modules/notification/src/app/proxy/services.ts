import { PushNotificationHubControllerService } from './eleon/notificator/module/eleon/notificator/module/http-api/controllers/push-notification-hub-controller.service';
import { NotificationLogService } from './notificator/module/controllers/notification-log.service';
import { NotificationsService } from './notificator/module/controllers/notifications.service';
import { PushNotificationService } from './notificator/module/controllers/push-notification.service';
import { UserNotificationSettingsService } from './notificator/module/controllers/user-notification-settings.service';
import { WebPushService } from './notificator/module/controllers/web-push.service';
import { NotificatorSettingsService } from './tenant-management/module/controllers/notificator-settings.service';

export const PROXY_SERVICES = [PushNotificationHubControllerService, NotificationLogService, NotificationsService, PushNotificationService, UserNotificationSettingsService, WebPushService, NotificatorSettingsService];