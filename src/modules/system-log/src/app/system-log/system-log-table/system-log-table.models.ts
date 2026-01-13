import { SystemLogDto } from '@eleon/system-log-proxy';

export interface ExtendedSystemLogDto extends SystemLogDto {
  severity: string;
  severityValue: string;
}
