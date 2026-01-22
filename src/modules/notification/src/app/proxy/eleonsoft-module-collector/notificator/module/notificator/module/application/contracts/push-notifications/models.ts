import type { NotificationPriority } from '../../../../../../../../eleonsoft-sdk/modules/messaging/module/system-messages/notificator/notification-priority.enum';

export interface PushNotificationDto {
  creationTime?: string;
  content?: string;
  isLocalizedData: boolean;
  languageKeyParams: string[];
  applicationName?: string;
  isRedirectEnabled: boolean;
  redirectUrl?: string;
  priority: NotificationPriority;
  isNewMessage: boolean;
}
