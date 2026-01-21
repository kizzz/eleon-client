import type { SystemLogLevel } from '../../../../../../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';

export interface GeneralNotificatorSettingsDto {
  serverType?: string;
  systemEmails: string[];
  minLogLevel: SystemLogLevel;
  sendErrors: boolean;
  systemEmailTemplate?: string;
  templateType?: string;
}
