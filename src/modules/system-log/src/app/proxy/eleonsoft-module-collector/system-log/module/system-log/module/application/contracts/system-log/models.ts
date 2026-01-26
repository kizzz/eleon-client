import type { SystemLogDto } from '../../../../../../../../doc-message-log/module/doc-message-logs/models';

export interface FullSystemLogDto extends SystemLogDto {
  extraProperties: Record<string, string>;
}

export interface MarkSystemLogsReadedRequestDto {
  logIds: string[];
  isReaded: boolean;
}
