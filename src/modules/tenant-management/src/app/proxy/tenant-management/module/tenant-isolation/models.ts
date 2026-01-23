import type { TenantWhitelistedIpDto } from '../../../tenant-settings/module/cache/models';

export interface SetIpIsolationRequestDto {
  tenantId?: string;
  ipIsolationEnabled: boolean;
  whitelistedIps: TenantWhitelistedIpDto[];
}
