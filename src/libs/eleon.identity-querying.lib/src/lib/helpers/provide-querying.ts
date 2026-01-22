import { IOrganizationUnitService, IRoleService, ITenantService, IUserService } from '@eleon/contracts.lib'
import { OrganizationUnitService, RoleService, TenantService, UserService } from '../services'
import { PROXY_SERVICES } from '../proxy'

export function provideIdentityQuerying() {
  return [
    ...PROXY_SERVICES.map(s => ({ provide: s, useClass: s })),
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
    }
  ]
}
