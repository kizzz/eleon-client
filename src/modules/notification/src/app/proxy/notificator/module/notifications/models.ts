import type { NotificationPriority } from '../../../eleonsoft-sdk/modules/messaging/module/system-messages/notificator/notification-priority.enum';
import type { NotificationType } from '../../../common/module/constants/notification-type.enum';
import type { SystemLogLevel } from '../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';
import type { NotificatorRecepientType } from '../../../common/module/constants/notificator-recepient-type.enum';

export interface NotificationDto {
  id?: string;
  recipients: NotificatorRecepientDto[];
  priority: NotificationPriority;
  message?: string;
  type: NotificationType;
  runImmidiate?: boolean;
  applicationName?: string;
  isLocalizedData: boolean;
  isRedirectEnabled: boolean;
  templateName?: string;
  redirectUrl?: string;
  languageKeyParams: string[];
  platform?: string;
  channelId?: string;
  isHtml: boolean;
  subject?: string;
  attachments: Record<string, string>;
  writeLog: boolean;
  logLevel: SystemLogLevel;
  extraProperties: Record<string, string>;
}

export interface NotificatorRecepientDto {
  refId?: string;
  recipientAddress?: string;
  type: NotificatorRecepientType;
}
