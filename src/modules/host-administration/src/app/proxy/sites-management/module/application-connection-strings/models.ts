export interface ConnectionStringDto {
  applicationName?: string;
  status?: string;
  connectionString?: string;
}

export interface CreateConnectionStringRequestDto {
  tenantId?: string;
  applicationName?: string;
  connectionString?: string;
  status?: string;
}

export interface RemoveConnectionStringRequestDto {
  tenantId?: string;
  applicationName?: string;
}

export interface SetConnectionStringRequestDto {
  tenantId?: string;
  applicationName?: string;
  connectionString?: string;
}

export interface UpdateConnectionStringRequestDto {
  tenantId?: string;
  applicationName?: string;
  connectionString?: string;
  status?: string;
}
