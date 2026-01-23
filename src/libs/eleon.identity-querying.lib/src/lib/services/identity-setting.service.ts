import { Injectable } from '@angular/core'
import { IdentitySettingDto, IIdentitySettingService } from '@eleon/contracts.lib'
import { IdentitySettingService } from '../proxy'
import { Observable } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class IdentitySettingsService extends IIdentitySettingService
{
  private proxy = new IdentitySettingService();

  getIdentitySettings() : Observable<IdentitySettingDto[]> {
    return this.proxy.getIdentitySettings();
  }
}