import type { ExternalLoginProviderType } from '../../../common/module/constants/external-login-provider-type.enum';
import type { VportalApplicationType } from '../../../common/module/constants/vportal-application-type.enum';
import type { TenantStatus } from '../../../common/module/constants/tenant-status.enum';
import type { TenantAppearanceSettingDto } from '../../../tenant-management/module/tenant-appearance/models';

export interface TenantContentSecurityHostDto {
  hostname?: string;
}

export interface TenantExternalLoginProviderDto {
  authority?: string;
  clientId?: string;
  clientSecret?: string;
  type: ExternalLoginProviderType;
  enabled: boolean;
  adminIdentifier?: string;
}

export interface TenantHostnameDto {
  id?: string;
  tenantId?: string;
  port: number;
  isSsl: boolean;
  domain?: string;
  url?: string;
  internal: boolean;
  applicationType: VportalApplicationType;
  acceptsClientCertificate: boolean;
  default: boolean;
  hostnameWithPort?: string;
  hostname?: string;
  appId?: string;
}

export interface TenantSettingDto {
  tenantId?: string;
  tenantIsolationEnabled: boolean;
  tenantCertificateHash?: string;
  ipIsolationEnabled: boolean;
  status: TenantStatus;
  hostnames: TenantHostnameDto[];
  externalProviders: TenantExternalLoginProviderDto[];
  whitelistedIps: TenantWhitelistedIpDto[];
  contentSecurityHosts: TenantContentSecurityHostDto[];
  appearanceSettings: TenantAppearanceSettingDto;
}

export interface TenantWhitelistedIpDto {
  tenantId?: string;
  ipAddress?: string;
  enabled: boolean;
}

export interface SetTenantProviderSettingsRequestDto {
  tenantId?: string;
  providers: TenantExternalLoginProviderDto[];
}
