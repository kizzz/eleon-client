import type { ExternalLoginProviderType } from '../../../../../../../../../../common/module/constants/external-login-provider-type.enum';
import type { TenantStatus } from '../../../../../../../../../../common/module/constants/tenant-status.enum';
import type { TenantHostnameDto } from '../../../../../../../tenant-settings/models';

export interface SetTenantProviderSettingsRequestDto {
  tenantId?: string;
  providers: TenantExternalLoginProviderDto[];
}

export interface TenantAppearanceSettingDto {
  lightLogo?: string;
  lightIcon?: string;
  darkLogo?: string;
  darkIcon?: string;
}

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
