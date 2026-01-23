import type { CommonOrganizationUnitDto } from '../organization-units/models';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface CommonUserDto {
  id?: string;
  name?: string;
  surname?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  organizationUnits: CommonOrganizationUnitDto[];
  creationTime?: string;
  lastLoginDate?: string;
  profilePicture?: string;
  profilePictureThumbnail?: string;
  isActive: boolean;
}

export interface GetCommonUsersInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  permissions?: string;
  ignoreCurrentUser: boolean;
  ignoredUsers: string[];
}

export interface ImportExcelUsersValueObjectDto {
  error: boolean;
  errorMessages: string[];
  csvUser?: string;
}
