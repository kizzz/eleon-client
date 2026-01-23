import type { TenantExternalLoginProviderDto, TenantSettingDto } from '../../../tenant-settings/module/cache/models';
import type { UserIsolationSettingsDto } from '../tenant-isolation/models';
import type { TenantAppearanceSettingDto } from '../tenant-appearance/models';
import type { ExternalLoginProviderType } from '../../../common/module/constants/external-login-provider-type.enum';

export interface TenantSettingsCacheValueDto {
  tenantSetting: TenantSettingDto;
  userIsolationSettings: UserIsolationSettingsDto[];
  adminIds: string[];
  isActive: boolean;
  tenantUrls: string[];
  tenantAppearanceSetting: TenantAppearanceSettingDto;
  tenantHostnames: string[];
  tenantSecureHostnames: string[];
  tenantNonSecureHostnames: string[];
  tenantCertificate?: string;
  tenantWhitelistedIps: string[];
  loginProviders: TenantExternalLoginProviderDto[];
  tenantContentSecurityHosts: string[];
  enabledProviders: ExternalLoginProviderType[];
  certificatesByUsersLookup: Record<string, string>;
  usersByCertificatesLookup: Record<string, string>;
  adminUserIds: string[];
}
