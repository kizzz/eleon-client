import type { MultiTenancySides } from '../../../volo/abp/multi-tenancy/multi-tenancy-sides.enum';

export interface CustomPermissionDto {
  id?: string;
  groupName?: string;
  name?: string;
  parentName?: string;
  displayName?: string;
  isEnabled: boolean;
  multiTenancySide: MultiTenancySides;
  providers?: string;
  stateCheckers?: string;
  order: number;
  dynamic: boolean;
  sourceId?: string;
}

export interface CustomPermissionGroupDto {
  id?: string;
  name?: string;
  displayName?: string;
  categoryName?: string;
  dynamic: boolean;
  order: number;
  sourceId?: string;
}
