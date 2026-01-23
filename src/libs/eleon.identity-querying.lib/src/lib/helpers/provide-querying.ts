import { IIdentitySettingService, IOrganizationUnitService, IProfileService, IRoleService, ITenantService, IUserService, IUserSettingService } from '@eleon/contracts.lib'
import { IdentitySettingsService, OrganizationUnitService, RoleService, TenantService, UserService, UserSettingService, UserProfileService } from '../services'
import { PROXY_SERVICES } from '../proxy'

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
    }
  ]
}
