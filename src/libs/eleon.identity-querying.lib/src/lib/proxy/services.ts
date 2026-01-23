import { OrganizationUnitQueryingService } from './core/infrastructure/module/controllers/organization-unit-querying.service';
import { TenantQueryingService } from './core/infrastructure/module/controllers/tenant-querying.service';
import { UserSettingsService } from './core/infrastructure/module/controllers/user-settings.service';
import { RoleQueryingService } from './core/infrastructure/module/controllers/role-querying.service';
import { UserQueryingService } from './core/infrastructure/module/controllers/user-querying.service';

export const PROXY_SERVICES = [OrganizationUnitQueryingService, TenantQueryingService, UserSettingsService, RoleQueryingService, UserQueryingService];