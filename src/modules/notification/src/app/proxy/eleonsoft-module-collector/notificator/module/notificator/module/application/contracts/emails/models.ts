import type { GeneralNotificatorSettingsDto } from '../notificator-settings/models';
import type { SmtpSettingsDto } from '../../../../../../../../module-collector/tenant-management/module/tenant-management/module/application/contracts/emails/models';
import type { SystemLogLevel } from '../../../../../../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';

export interface AzureEwsSettingsDto {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  exchangeUrl?: string;
  impersonatedSmtpAddress?: string;
  anchorMailbox?: string;
  traceEnabled: boolean;
  ignoreServerCertificateErrors: boolean;
  ewsScopes: string[];
}

export interface NotificatorSettingsDto {
  generalSettings: GeneralNotificatorSettingsDto;
  smtpSettings: SmtpSettingsDto;
  azureEws: AzureEwsSettingsDto;
  telegram: TelegramSettingsDto;
}

export interface TelegramSettingsDto {
  enabled: boolean;
  botToken?: string;
  chatId?: string;
  systemBotToken?: string;
  systemChatId?: string;
  minLogLevel: SystemLogLevel;
  messageTemplate?: string;
  templateType?: string;
}
