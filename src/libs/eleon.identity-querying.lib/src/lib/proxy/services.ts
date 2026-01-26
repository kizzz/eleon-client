import { OrganizationUnitQueryingService } from './core/infrastructure/module/controllers/organization-unit-querying.service';
import { TenantQueryingService } from './core/infrastructure/module/controllers/tenant-querying.service';
import { TenantSettingsService } from './core/infrastructure/module/controllers/tenant-settings.service';
import { UserSettingsService } from './core/infrastructure/module/controllers/user-settings.service';
import { RoleQueryingService } from './core/infrastructure/module/controllers/role-querying.service';
import { UserQueryingService } from './core/infrastructure/module/controllers/user-querying.service';
import { FeaturesService } from './tenant-management/module/controllers/features.service';
import { IdentitySettingService } from './tenant-management/module/controllers/identity-setting.service';
import { ProfileService } from './tenant-management/module/controllers/profile.service';
import { UserProfilePictureService } from './tenant-management/module/controllers/user-profile-picture.service';

export const PROXY_SERVICES = [OrganizationUnitQueryingService, TenantQueryingService, TenantSettingsService, UserSettingsService, RoleQueryingService, UserQueryingService, FeaturesService, IdentitySettingService, ProfileService, UserProfilePictureService];