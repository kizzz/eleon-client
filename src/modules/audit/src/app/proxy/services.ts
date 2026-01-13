import { AuditService } from './module-collector/auditor/module/auditor/module/http-api/controllers/audit.service';
import { AuditHistoryRecordService } from './auditor/module/controllers/audit-history-record.service';

export const PROXY_SERVICES = [AuditService, AuditHistoryRecordService];