
export interface SetIpIsolationRequestDto {
  tenantId?: string;
  ipIsolationEnabled: boolean;
  whitelistedIps: TenantWhitelistedIpDto[];
}

export interface SetTenantIsolationRequestDto {
  tenantId?: string;
  enabled: boolean;
  certificatePemBase64?: string;
  password?: string;
}

export interface TenantWhitelistedIpDto {
  tenantId?: string;
  ipAddress?: string;
  enabled: boolean;
}

export interface ValidateClientIsolationDto {
}
