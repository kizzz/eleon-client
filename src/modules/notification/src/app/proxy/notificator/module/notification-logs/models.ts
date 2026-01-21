import type { NotificationPriority } from '../../../eleonsoft-sdk/modules/messaging/module/system-messages/notificator/notification-priority.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { NotificationType } from '../../../common/module/constants/notification-type.enum';

export interface NotificationLogDto {
  creationTime?: string;
  id?: string;
  userId?: string;
  content?: string;
  isLocalizedData: boolean;
  languageKeyParams?: string;
  applicationName?: string;
  isRedirectEnabled: boolean;
  isRead: boolean;
  redirectUrl?: string;
  priority: NotificationPriority;
}

export interface NotificationLogListRequestDto extends PagedAndSortedResultRequestDto {
  typeFilter: NotificationType[];
  fromDate?: string;
  toDate?: string;
  applicationName?: string;
}

export interface RecentNotificationLogListRequestDto extends PagedAndSortedResultRequestDto {
  applicationName?: string;
}
