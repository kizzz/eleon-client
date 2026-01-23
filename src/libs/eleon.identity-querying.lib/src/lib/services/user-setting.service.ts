import { Injectable } from '@angular/core'
import { IUserSettingService } from '@eleon/contracts.lib'
import { UserSettingsService } from '../proxy'
import { map, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UserSettingService extends IUserSettingService {
  private proxy = new UserSettingsService();

  getUserSetting(key: string, userId?: string): Observable<string | null> {
    if (userId) {
      return this.proxy.getUserSetting(userId, key);
    }
    else{
      return this.proxy.getCurrentUserSetting(key);
    }
  }
  
  getAppearanceSetting(appId: string): Observable<string | null> {
    return this.proxy.getAppearanceSetting(appId).pipe(map(res => res.value));
  }

  setUserSetting(key: string, value: string, userId?: string): Observable<void> {
    if (userId) {
      return this.proxy.setUserSetting(userId, key, value);
    }
    else{
      return this.proxy.setCurrentUserSetting(key, value);
    }
  }

  setAppearanceSetting(appId: string, value: string): Observable<void> {
    return this.proxy.setAppearanceSetting(appId, value).pipe(map(() => {}));
  }
}