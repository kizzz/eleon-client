import type { LanguageInfo } from '../../../localization/models';
import type { NameValue } from '../../../models';

export interface ApplicationAuthConfigurationDto {
  grantedPolicies: Record<string, boolean>;
}

export interface ApplicationFeatureConfigurationDto {
  values: Record<string, string>;
}

export interface ApplicationLocalizationConfigurationDto {
  values: Record<string, Record<string, string>>;
  resources: Record<string, ApplicationLocalizationResourceDto>;
  languages: LanguageInfo[];
  currentCulture: CurrentCultureDto;
  defaultResourceName?: string;
  languagesMap: Record<string, NameValue[]>;
  languageFilesMap: Record<string, NameValue[]>;
}

export interface ApplicationLocalizationResourceDto {
  texts: Record<string, string>;
  baseResources: string[];
}

export interface CurrentCultureDto {
  displayName?: string;
  englishName?: string;
  threeLetterIsoLanguageName?: string;
  twoLetterIsoLanguageName?: string;
  isRightToLeft: boolean;
  cultureName?: string;
  name?: string;
  nativeName?: string;
  dateTimeFormat: DateTimeFormatDto;
}

export interface CurrentUserDto {
  isAuthenticated: boolean;
  id?: string;
  tenantId?: string;
  impersonatorUserId?: string;
  impersonatorTenantId?: string;
  impersonatorUserName?: string;
  impersonatorTenantName?: string;
  userName?: string;
  name?: string;
  surName?: string;
  email?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneNumberVerified: boolean;
  roles: string[];
  sessionId?: string;
}

export interface DateTimeFormatDto {
  calendarAlgorithmType?: string;
  dateTimeFormatLong?: string;
  shortDatePattern?: string;
  fullDateTimePattern?: string;
  dateSeparator?: string;
  shortTimePattern?: string;
  longTimePattern?: string;
}
