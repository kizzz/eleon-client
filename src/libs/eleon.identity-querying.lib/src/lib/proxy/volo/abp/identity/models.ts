import type { ExtensibleEntityDto, ExtensibleFullAuditedEntityDto } from '@eleon/proxy-utils.lib';

export interface IdentityUserDto extends ExtensibleFullAuditedEntityDto<string> {
  tenantId?: string;
  userName?: string;
  name?: string;
  surname?: string;
  email?: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  isActive: boolean;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  lockoutEnd?: string;
  concurrencyStamp?: string;
  entityVersion: number;
  lastPasswordChangeTime?: string;
}

export interface IdentityRoleDto extends ExtensibleEntityDto<string> {
  name?: string;
  isDefault: boolean;
  isStatic: boolean;
  isPublic: boolean;
  concurrencyStamp?: string;
  creationTime?: string;
}
