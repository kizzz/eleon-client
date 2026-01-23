import type { IdentitySettingType } from '../../../eleonsoft-module-collector/commons/module/constants/identity-settings/identity-setting-type.enum';

export interface IdentitySettingDto {
  name?: string;
  groupName?: string;
  displayName?: string;
  description?: string;
  type: IdentitySettingType;
  value?: string;
}
