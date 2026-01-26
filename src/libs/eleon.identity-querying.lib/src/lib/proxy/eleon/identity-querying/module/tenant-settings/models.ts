import type { VportalApplicationType } from '../../../../common/module/constants/vportal-application-type.enum';
import type { SystemLogLevel } from '../../../logging/lib/system-log/contracts/system-log-level.enum';

export interface TenantHostnameDto {
  id?: string;
  tenantId?: string;
  port: number;
  isSsl: boolean;
  domain?: string;
  url?: string;
  internal: boolean;
  applicationType: VportalApplicationType;
  acceptsClientCertificate: boolean;
  default: boolean;
  hostnameWithPort?: string;
  hostname?: string;
  appId?: string;
}

export interface LoggingSettingsDto {
  sendLogsFromUI: boolean;
  minimumLogLevel: SystemLogLevel;
}

export interface TelemetrySettingsDto {
  enabled: boolean;
  enabledOnClient: boolean;
  tracesEndpoint?: string;
  tracesProtocol?: string;
  tracesUseBatch: boolean;
  metricsEndpoint?: string;
  metricsProtocol?: string;
  metricsUseBatch: boolean;
  logsEndpoint?: string;
  logsProtocol?: string;
  logsUseBatch: boolean;
  storageProviderId?: string;
}

export interface TenantSystemHealthSettingsDto {
  telemetry: TelemetrySettingsDto;
  logging: LoggingSettingsDto;
}
