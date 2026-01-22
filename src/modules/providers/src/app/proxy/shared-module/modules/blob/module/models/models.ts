import type { StorageProviderSettingsTypes } from '../../../../../eleon/storage/lib/constants/storage-provider-settings-types.enum';

export interface StorageProviderDto {
  id?: string;
  name?: string;
  isActive: boolean;
  isTested: boolean;
  fullType?: string;
  storageProviderTypeName?: string;
  settings: StorageProviderSettingDto[];
}

export interface StorageProviderSettingDto {
  id?: string;
  storageProviderId?: string;
  value?: string;
  key?: string;
}

export interface StorageProviderSettingTypeDto {
  storageProviderTypeName?: string;
  type: StorageProviderSettingsTypes;
  key?: string;
  defaultValue?: string;
  description?: string;
  hidden: boolean;
  required: boolean;
}
