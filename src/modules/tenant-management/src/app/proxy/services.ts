import { DomainSettingsService } from './tenant-management/module/controllers/domain-settings.service';
import { TenantClientIsolationService } from './tenant-management/module/controllers/tenant-client-isolation.service';
import { TenantContentSecurityService } from './tenant-management/module/controllers/tenant-content-security.service';
import { TenantService } from './core/infrastructure/module/controllers/tenant.service';
import { HostService } from './controllers/host.service';

export const PROXY_SERVICES = [DomainSettingsService, TenantClientIsolationService, TenantContentSecurityService, TenantService, HostService];