import { SystemLogService } from './doc-message-log/module/controllers/system-log.service';
import { AuditLogService } from './infrastructure/feature/module/controllers/audit-log.service';
import { SecurityLogService } from './infrastructure/feature/module/controllers/security-log.service';

export const PROXY_SERVICES = [SystemLogService, AuditLogService, SecurityLogService];