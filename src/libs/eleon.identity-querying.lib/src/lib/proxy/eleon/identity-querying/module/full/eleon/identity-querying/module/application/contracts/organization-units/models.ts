import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface CommonOrganizationUnitDto {
  id?: string;
  parentId?: string;
  code?: string;
  displayName?: string;
  tenantId?: string;
  isEnabled: boolean;
}

export interface GetAllUnitAndChildsMembersRequestDto extends PagedAndSortedResultRequestDto {
  orgUnitId?: string;
  searchQuery?: string;
}

export interface GetAvatilableOrgUnitsInput {
  userId?: string;
}

export interface UserOrganizationUnitLookupDto {
  organizationUnit: CommonOrganizationUnitDto;
  isMember: boolean;
}
