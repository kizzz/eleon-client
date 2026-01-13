import { Injectable } from '@angular/core'
import { CommonUserDto, GetCommonUsersInput, IUserService } from '@eleon/contracts.lib'
import { PagedResultDto } from '@eleon/proxy-utils.lib'
import { UserQueryingService } from '../proxy/core/infrastructure/module/controllers/user-querying.service'
import { IdentityUserDto } from '../proxy/volo/abp/identity/models'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class UserService extends IUserService {

  private readonly proxy = new UserQueryingService()

  constructor() {
    super()
  }

  getById(userId: string): Observable<CommonUserDto> {
    return this.proxy.getByIdById(userId)
  }

  getCurrentUser(): Observable<CommonUserDto> {
    return this.proxy.getCurrentUser().pipe(map(user => this.mapIdentityToCommon(user)))
  }

  getList(input: GetCommonUsersInput): Observable<{ items: CommonUserDto[]; totalCount: number }> {
    return this.proxy.getList(input).pipe(map(u => ({ items: u.items, totalCount: u.totalCount })))
  }

  private mapIdentityToCommon(user: IdentityUserDto): CommonUserDto {
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      creationTime: user.creationTime ? user.creationTime.toString() : undefined,
      lastLoginDate: user.lastPasswordChangeTime ? user.lastPasswordChangeTime.toString() : undefined,
      roles: [],
      organizationUnits: [],
      isActive: user.isActive
    }
  }
}
