import { IdentitySettingService } from './tenant-management/module/controllers/identity-setting.service';
import { ProfileService } from './tenant-management/module/controllers/profile.service';
import { UserProfilePictureService } from './tenant-management/module/controllers/user-profile-picture.service';
import { OrganizationUnitQueryingService } from './core/infrastructure/module/controllers/organization-unit-querying.service';
import { TenantQueryingService } from './core/infrastructure/module/controllers/tenant-querying.service';
import { UserSettingsService } from './core/infrastructure/module/controllers/user-settings.service';
import { RoleQueryingService } from './core/infrastructure/module/controllers/role-querying.service';
import { UserQueryingService } from './core/infrastructure/module/controllers/user-querying.service';

export const PROXY_SERVICES = [IdentitySettingService, ProfileService, UserProfilePictureService, OrganizationUnitQueryingService, TenantQueryingService, UserSettingsService, RoleQueryingService, UserQueryingService];