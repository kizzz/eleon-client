
export interface SmtpSettingsDto {
  smtpHost?: string;
  smtpPort: number;
  smtpUserName?: string;
  smtpPassword?: string;
  smtpDomain?: string;
  smtpEnableSsl: boolean;
  smtpUseDefaultCredentials: boolean;
  defaultFromAddress?: string;
  defaultFromDisplayName?: string;
}

export interface SendTestEmailInputDto {
  senderEmailAddress: string;
  targetEmailAddress: string;
  subject: string;
  body?: string;
}

export interface SendTestTelegramInputDto {
  message?: string;
  chatId?: string;
  botToken?: string;
}
