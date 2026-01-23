import type { VportalApplicationType } from '../../../common/module/constants/vportal-application-type.enum';

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

export interface TenantWhitelistedIpDto {
  tenantId?: string;
  ipAddress?: string;
  enabled: boolean;
}
