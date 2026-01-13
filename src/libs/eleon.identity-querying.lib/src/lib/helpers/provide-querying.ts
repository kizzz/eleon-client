import { IOrganizationUnitService, IRoleService, ITenantService, IUserService } from '@eleon/contracts.lib'
import { OrganizationUnitService, RoleService, TenantService, UserService } from '../services'

export function provideIdentityQuerying() {
  return [
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
