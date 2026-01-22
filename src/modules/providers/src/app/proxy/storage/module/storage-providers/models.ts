import type { StorageProviderSettingTypeDto } from '../../../shared-module/modules/blob/module/models/models';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface PossibleStorageProviderSettingsDto {
  type?: string;
  possibleSettings: StorageProviderSettingTypeDto[];
}

export interface StorageProviderListRequestDto extends PagedAndSortedResultRequestDto {
  searchQuery?: string;
}
