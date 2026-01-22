import type { NotificationSourceType } from '../../../common/module/constants/notification-source-type.enum';

export interface UserNotificationSettingsDto {
  sourceType: NotificationSourceType;
  sendNative: boolean;
  sendEmail: boolean;
}
