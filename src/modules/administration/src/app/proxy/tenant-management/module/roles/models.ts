import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { IdentityUserDto } from '../../../volo/abp/identity/models';

export interface AddUserToRoleInput {
  userId?: string;
  role?: string;
}

export interface CommonRoleDto {
  id?: string;
  name?: string;
  isReadOnly: boolean;
  inheritedFrom?: string;
  isDefault: boolean;
  isPublic: boolean;
}

export interface GetCommonRolesInput extends PagedAndSortedResultRequestDto {
  filter?: string;
}

export interface GetUsersInRoleInput {
  roleName?: string;
  userNameFilter?: string;
  skipCount: number;
  maxResultCount: number;
  exclusionMode: boolean;
}

export interface RemoveUserFromRoleInput {
  userId?: string;
  role?: string;
}

export interface RoleUserLookupDto {
  user: IdentityUserDto;
  providers: string[];
  editable: boolean;
}

export interface UserRoleLookupDto {
  roleName?: string;
  providers: string[];
  editable: boolean;
}
