import type { VportalApplicationType } from '../../../../../../../../../../common/module/constants/vportal-application-type.enum';

export interface CreateCorporateDomainRequestDto {
  domainName?: string;
  certificatePemBase64?: string;
  password?: string;
  acceptsClientCertificate: boolean;
  default: boolean;
  isSsl: boolean;
  port: number;
  appId?: string;
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

export interface UpdateCorporateDomainRequestDto {
  hostnameId?: string;
  domainName?: string;
  certificatePemBase64?: string;
  password?: string;
  acceptsClientCertificate: boolean;
  isSsl: boolean;
  default: boolean;
  port: number;
  appId?: string;
}
