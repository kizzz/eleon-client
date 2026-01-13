import { TenantQueryingService } from './core/infrastructure/module/controllers/tenant-querying.service';
import { OrganizationUnitQueryingService } from './core/infrastructure/module/controllers/organization-unit-querying.service';
import { RoleQueryingService } from './core/infrastructure/module/controllers/role-querying.service';
import { UserQueryingService } from './core/infrastructure/module/controllers/user-querying.service';

export const PROXY_SERVICES = [TenantQueryingService, OrganizationUnitQueryingService, RoleQueryingService, UserQueryingService];