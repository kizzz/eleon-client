import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface FullSecurityLogDto extends SecurityLogDto {
  extraProperties: Record<string, string>;
}

export interface SecurityLogDto {
  id?: string;
  tenantId?: string;
  applicationName?: string;
  identity?: string;
  action?: string;
  userId?: string;
  userName?: string;
  tenantName?: string;
  clientId?: string;
  correlationId?: string;
  clientIpAddress?: string;
  browserInfo?: string;
  creationTime?: string;
  extraProperties: Record<string, string>;
}

export interface SecurityLogListRequestDto extends PagedAndSortedResultRequestDto {
  sorting?: string;
  maxResultCount: number;
  skipCount: number;
  startTime?: string;
  endTime?: string;
  action?: string;
  identity?: string;
  userId?: string;
  userName?: string;
  applicationName?: string;
  clientId?: string;
  correlationId?: string;
  clientIpAddress?: string;
}
