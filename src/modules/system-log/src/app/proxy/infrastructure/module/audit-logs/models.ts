import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { EntityChangeType } from '../../../volo/abp/auditing/entity-change-type.enum';

export interface AuditLogActionDto {
  id?: string;
  tenantId?: string;
  auditLogId?: string;
  serviceName?: string;
  methodName?: string;
  parameters?: string;
  executionTime?: string;
  executionDuration: number;
}

export interface AuditLogDto {
  id?: string;
  applicationName?: string;
  userId?: string;
  userName?: string;
  tenantId?: string;
  tenantName?: string;
  impersonatorUserId?: string;
  impersonatorUserName?: string;
  impersonatorTenantId?: string;
  impersonatorTenantName?: string;
  executionTime?: string;
  executionDuration: number;
  clientIpAddress?: string;
  clientName?: string;
  clientId?: string;
  correlationId?: string;
  browserInfo?: string;
  httpMethod?: string;
  url?: string;
  exceptions?: string;
  comments?: string;
  httpStatusCode?: number;
  entityChanges: EntityChangeDto[];
  actions: AuditLogActionDto[];
  extraProperties: Record<string, string>;
}

export interface AuditLogHeaderDto {
  id?: string;
  tenantId?: string;
  correlationId?: string;
  applicationName?: string;
  url?: string;
  userName?: string;
  clientIpAddress?: string;
  executionTime?: string;
  executionDuration: number;
  httpMethod?: string;
  httpStatusCode?: number;
}

export interface AuditLogListRequestDto extends PagedAndSortedResultRequestDto {
  sorting?: string;
  maxResultCount: number;
  skipCount: number;
  startTime?: string;
  endTime?: string;
  httpMethod?: string;
  url?: string;
  userId?: string;
  userName?: string;
  applicationName?: string;
  clientIpAddress?: string;
  correlationId?: string;
  maxExecutionDuration?: number;
  minExecutionDuration?: number;
  hasException?: boolean;
  httpStatusCode?: number;
}

export interface EntityChangeDto {
  id?: string;
  auditLogId?: string;
  tenantId?: string;
  updatedById?: string;
  updatedByName?: string;
  changeTime?: string;
  changeType: EntityChangeType;
  entityTenantId?: string;
  entityId?: string;
  entityTypeFullName?: string;
  propertyChanges: EntityPropertyChangeDto[];
  extraProperties: Record<string, string>;
}

export interface EntityChangeListRequestDto extends PagedAndSortedResultRequestDto {
  sorting?: string;
  maxResultCount: number;
  skipCount: number;
  auditLogId?: string;
  startTime?: string;
  endTime?: string;
  entityChangeType?: EntityChangeType;
  entityId?: string;
  entityTypeFullName?: string;
}

export interface EntityPropertyChangeDto {
  id?: string;
  tenantId?: string;
  entityChangeId?: string;
  newValue?: string;
  originalValue?: string;
  propertyName?: string;
  propertyTypeFullName?: string;
}
