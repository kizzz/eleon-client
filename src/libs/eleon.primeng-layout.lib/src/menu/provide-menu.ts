import { IAuthManager, IPermissionService, IVPortalMenuService, IVPortalTopbarService, IVPortalUserMenuService } from '@eleon/contracts.lib'
import { VPortalUserMenuService } from './vportal-user-menu.service'
import { VPortalMenuService } from './vportal-menu.service'
import { VPortalTopbarService } from './vportal-topbar.service'

export function provideVPortalMenu(): any[] {
  return [
    {
      provide: IVPortalUserMenuService,
      useFactory: () => {
        return new VPortalUserMenuService();
      }
    },
    {
      provide: IVPortalMenuService,
      useFactory: (permissionService: IPermissionService, authManager: IAuthManager) => {
        return new VPortalMenuService(permissionService, authManager);
      },
      deps: [IPermissionService, IAuthManager]
    },
    {
      provide: IVPortalTopbarService,
      useFactory: (permissionService: IPermissionService) => {
        return new VPortalTopbarService(permissionService);
      },
      deps: [IPermissionService]
    },
  ]
}