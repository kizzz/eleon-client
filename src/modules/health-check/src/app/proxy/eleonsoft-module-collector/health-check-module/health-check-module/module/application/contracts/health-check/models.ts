import type { HealthCheckStatus } from '../../../domain/shared/constants/health-check-status.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';
import type { ReportInformationSeverity } from '../../../../../../../eleonsoft-sdk/modules/messaging/module/system-messages/health-check/report-information-severity.enum';

export interface AddHealthCheckReportBulkDto {
  reports: AddHealthCheckReportDto[];
}

export interface AddHealthCheckReportDto {
  serviceName?: string;
  serviceVersion?: string;
  upTime?: string;
  checkName?: string;
  status: HealthCheckStatus;
  message?: string;
  isPublic: boolean;
  healthCheckId?: string;
  extraInformation: ReportExtraInformationDto[];
}

export interface CreateHealthCheckDto {
  type?: string;
  initiatorName?: string;
}

export interface FullHealthCheckDto extends HealthCheckDto {
  extraProperties: Record<string, object>;
  reports: HealthCheckReportDto[];
}

export interface HealthCheckDto {
  id?: string;
  type?: string;
  initiatorName?: string;
  status: HealthCheckStatus;
  creationTime?: string;
}

export interface HealthCheckReportDto {
  id?: string;
  serviceName?: string;
  serviceVersion?: string;
  upTime?: string;
  checkName?: string;
  status: HealthCheckStatus;
  message?: string;
  tenantId?: string;
  isPublic: boolean;
  creationTime?: string;
  healthCheckId?: string;
  extraInformation: ReportExtraInformationDto[];
}

export interface HealthCheckRequestDto extends PagedAndSortedResultRequestDto {
  type?: string;
  initiator?: string;
  minTime?: string;
  maxTime?: string;
}

export interface ReportExtraInformationDto {
  key?: string;
  value?: string;
  severity: ReportInformationSeverity;
  type?: string;
}

export interface SendHealthCheckDto {
  id?: string;
  type?: string;
  initiatorName?: string;
  reports: HealthCheckReportDto[];
}
