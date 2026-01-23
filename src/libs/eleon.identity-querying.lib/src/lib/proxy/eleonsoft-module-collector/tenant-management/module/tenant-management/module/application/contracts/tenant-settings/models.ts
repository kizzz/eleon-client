import type { SystemLogLevel } from '../../../../../../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';

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
