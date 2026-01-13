
export interface CommonTenantDto {
  id?: string;
  name?: string;
  entityVersion: number;
  isRoot: boolean;
  connectionStrings: TenantConnectionStringDto[];
}

export interface CommonTenantExtendedDto extends CommonTenantDto {
  parentId?: string;
  isRoot: boolean;
}

export interface TenantConnectionStringDto {
  tenantId?: string;
  name?: string;
  value?: string;
}
