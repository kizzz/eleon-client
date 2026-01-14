import type { SystemLogLevel } from '../../../../../../../../eleon/logging/lib/system-log/contracts/system-log-level.enum';
import type { SystemLogDto } from '../../../../../../../../doc-message-log/module/doc-message-logs/models';

export interface CreateSystemLogDto {
  message?: string;
  logLevel: SystemLogLevel;
  applicationName?: string;
  extraProperties: Record<string, string>;
}

export interface FullSystemLogDto extends SystemLogDto {
  extraProperties: Record<string, string>;
}

export interface MarkSystemLogsReadedRequestDto {
  logIds: string[];
  isReaded: boolean;
}
