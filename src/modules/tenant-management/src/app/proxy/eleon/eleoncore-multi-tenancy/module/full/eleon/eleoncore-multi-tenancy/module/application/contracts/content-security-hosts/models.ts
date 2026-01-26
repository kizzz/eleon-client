
export interface AddTenantContentSecurityHostDto {
  tenantId?: string;
  hostname?: string;
}

export interface RemoveTenantContentSecurityHostDto {
  tenantId?: string;
  contentSecurityHostId?: string;
}

export interface UpdateTenantContentSecurityHostDto {
  tenantId?: string;
  contentSecurityHostId?: string;
  newHostname?: string;
}
