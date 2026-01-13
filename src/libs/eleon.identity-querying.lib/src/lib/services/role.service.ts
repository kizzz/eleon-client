import { Injectable } from '@angular/core'
import { CommonRoleDto, GetCommonRolesInput, IRoleService } from '@eleon/contracts.lib'
import { PagedResultDto } from '@eleon/proxy-utils.lib'
import { RoleQueryingService } from '../proxy/core/infrastructure/module/controllers/role-querying.service'
import { Observable } from 'rxjs'
import { IdentityRoleDto } from '../proxy/volo/abp/identity/models'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class RoleService extends IRoleService {
  constructor(private proxy: RoleQueryingService) {
    super()
  }

  getById(roleId: string): Observable<CommonRoleDto> {
    return this.proxy.get(roleId).pipe(
      // map identity role into common contract shape
      map((role: IdentityRoleDto): CommonRoleDto => ({
        id: role.id,
        name: role.name,
        isDefault: role.isDefault,
        isPublic: role.isPublic,
        isReadOnly: false,
        inheritedFrom: undefined
      }))
    )
  }

  getList(input: GetCommonRolesInput): Observable<{ items: CommonRoleDto[]; totalCount: number }> {
    return this.proxy.getList(input).pipe(map((r) => ({ items: r.items, totalCount: r.totalCount })));
  }
}
