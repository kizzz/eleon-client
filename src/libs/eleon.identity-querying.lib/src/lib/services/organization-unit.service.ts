import { Injectable } from '@angular/core'
import { CommonOrganizationUnitDto, CommonUserDto, GetAllUnitAndChildsMembersRequestDto, IOrganizationUnitService } from '@eleon/contracts.lib'
import { PagedResultDto } from '@eleon/proxy-utils.lib'
import { OrganizationUnitQueryingService } from '../proxy/core/infrastructure/module/controllers/organization-unit-querying.service'
import { map, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class OrganizationUnitService extends IOrganizationUnitService {
  
  constructor(private proxy: OrganizationUnitQueryingService) {
    super()
  }

  getById(id: string, includeSoftDeleted?: boolean): Observable<CommonOrganizationUnitDto> {
    return this.proxy.getById(id, includeSoftDeleted)
  }

  getList(): Observable<CommonOrganizationUnitDto[]> {
    return this.proxy.getList()
  }

  getMembers(input: GetAllUnitAndChildsMembersRequestDto): Observable<{ items: CommonUserDto[]; totalCount: number }> {
    return this.proxy.getAllUnitAndChildsMembers(input).pipe(map((r) => ({ items: r.items, totalCount: r.totalCount })));
  }

  getAvailableForUser(userId?: string): Observable<{ organizationUnit: CommonOrganizationUnitDto; isMember: boolean }[]> {
    return this.proxy.getAvailableForUser({ userId: userId }).pipe(map((r) => r.map(x => ({ organizationUnit: x.organizationUnit, isMember: x.isMember }))));
  }
  
}
