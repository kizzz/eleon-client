import type { SystemLogLevel } from '../../../../../../../../../logging/lib/system-log/contracts/system-log-level.enum';

export interface CreateSystemLogDto {
  message?: string;
  logLevel: SystemLogLevel;
  applicationName?: string;
  extraProperties: Record<string, string>;
}
