
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

export interface CreateDatabaseDto {
  tenantId?: string;
  newDatabaseName?: string;
  newUserName?: string;
  newUserPassword?: string;
}

export interface CreateTenantRequestDto {
  tenantName?: string;
  adminEmail?: string;
  adminPassword?: string;
  createDatabase: boolean;
  isRoot: boolean;
  newDatabaseName?: string;
  newUserName?: string;
  newUserPassword?: string;
  defaultConnectionString?: string;
}

export interface TenantConnectionStringDto {
  tenantId?: string;
  name?: string;
  value?: string;
}

export interface TenantCreationResult {
  tenantName?: string;
  tenantId?: string;
  error?: string;
  success: boolean;
}
