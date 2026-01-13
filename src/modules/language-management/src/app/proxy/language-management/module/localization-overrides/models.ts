import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { LanguageInfoDto } from '../languages/models';

export interface GetLocalizationRequest {
  culture?: string;
  localizationResources: string[];
}

export interface GetLocalizationStringsRequest extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
  targetCulture?: string;
  baseCulture?: string;
  onlyEmpty: boolean;
  localizationResources: string[];
}

export interface LocalizationDto {
  culture?: string;
  resources: LocalizationResourceDto[];
}

export interface LocalizationInformationDto {
  localizationResources: string[];
  languages: LanguageInfoDto[];
  defaultCulture?: string;
}

export interface LocalizationResourceDto {
  resourceName?: string;
  texts: Record<string, string>;
}

export interface OverriddenLocalizationStringDto {
  fullKey?: string;
  key?: string;
  base?: string;
  target?: string;
  isOverride: boolean;
  resource?: string;
}

export interface OverrideLocalizationEntryRequest {
  resourceName?: string;
  key?: string;
  cultureName?: string;
  newValue?: string;
}
