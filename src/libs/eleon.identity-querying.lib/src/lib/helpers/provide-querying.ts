import { IFeaturesService, IIdentitySettingService, IOrganizationUnitService, IProfileService, IRoleService, ITenantService, ITenantSettingService, IUserService, IUserSettingService } from '@eleon/contracts.lib'
import { IdentitySettingsService, OrganizationUnitService, RoleService, TenantService, UserService, UserSettingService, UserProfileService, FeatureService } from '../services'
import { PROXY_SERVICES } from '../proxy'
import { TenantSettingService } from '../services/tenant-setting.service'

export function provideIdentityQuerying() {
  return [
    ...PROXY_SERVICES.map(s => ({ provide: s, useClass: s })),
    {
      provide: IUserSettingService,
      useClass: UserSettingService
    },
    {
      provide: IUserService,
      useClass: UserService
    },
    {
      provide: IRoleService,
      useClass: RoleService
    },
    {
      provide: IOrganizationUnitService,
      useClass: OrganizationUnitService
    },
    {
      provide: ITenantService,
      useClass: TenantService
    },
    {
      provide: IProfileService,
      useClass: UserProfileService
    },
    {
      provide: IIdentitySettingService,
      useClass: IdentitySettingsService
    },
    {
      provide: ITenantSettingService,
      useClass: TenantSettingService
    },
    {
      provide: IFeaturesService,
      useClass: FeatureService
    }
  ]
}
