
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
