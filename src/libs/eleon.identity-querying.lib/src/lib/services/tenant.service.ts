import { Injectable } from '@angular/core'
import { CommonTenantDto, CommonTenantExtendedDto, ITenantService } from '@eleon/contracts.lib'
import { TenantQueryingService } from '../proxy/core/infrastructure/module/controllers/tenant-querying.service'
import { map, Observable } from 'rxjs'
import { GetTenantsInput, TenantDto } from '../proxy/volo/abp/tenant-management/models'

@Injectable({
  providedIn: 'root'
})
export class TenantService extends ITenantService {

  constructor(private proxy: TenantQueryingService) {
    super()
  }

  getById(id: string): Observable<TenantDto> {
    return this.proxy.get(id)
  }

  getList(maxResultCount: number, skipCount: number, filter: string, sorting: string): Observable<{ items: TenantDto[]; totalCount: number }> {
    const input: GetTenantsInput = { maxResultCount, skipCount, filter, sorting };
    return this.proxy.getList(input).pipe(map((r) => ({ items: r.items, totalCount: r.totalCount })));
  }

  getCommonTenantList(): Observable<CommonTenantDto[]> {
    return this.proxy.getCommonTenantList()
  }

  getCommonTenantExtendedList(): Observable<CommonTenantExtendedDto[]> {
    return this.proxy.getCommonTenantExtendedList()
  }

}
