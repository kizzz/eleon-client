import type { FeatureValueType } from './feature-value-type.enum';
import type { MultiTenancySides } from '../../../volo/abp/multi-tenancy/multi-tenancy-sides.enum';

export interface FeatureDescription {
  name?: string;
  localizationKey?: string;
  defaultValue?: string;
  type: FeatureValueType;
  displayName?: string;
  permissions: PermissionGroupDescription[];
}

export interface FeatureGroupDescription {
  name?: string;
  localizationKey?: string;
  displayName?: string;
  children: FeatureDescription[];
}

export interface PermissionDescription {
  name?: string;
  localizationKey?: string;
  displayName?: string;
  multiTenancySide: MultiTenancySides;
  children: PermissionDescription[];
}

export interface PermissionGroupDescription {
  name?: string;
  localizationKey?: string;
  displayName?: string;
  children: PermissionDescription[];
}
