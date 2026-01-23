
export interface SetTenantIsolationRequestDto {
  tenantId?: string;
  enabled: boolean;
  certificatePemBase64?: string;
  password?: string;
}

export interface ValidateClientIsolationDto {
}
