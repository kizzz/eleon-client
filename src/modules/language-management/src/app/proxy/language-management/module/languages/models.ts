
export interface LanguageDto {
  id?: string;
  cultureName?: string;
  uiCultureName?: string;
  displayName?: string;
  twoLetterISOLanguageName?: string;
  isEnabled: boolean;
  isDefault: boolean;
}

export interface LanguageInfoDto {
  cultureName?: string;
  uiCultureName?: string;
  displayName?: string;
  twoLetterISOLanguageName?: string;
  flagIcon?: string;
}

export interface SetLanguageEnabledDto {
  languageId?: string;
  isEnabled: boolean;
}
