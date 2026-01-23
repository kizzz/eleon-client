import { Injectable } from '@angular/core'
import { ITenantSettingService, SetTenantProviderSettingsRequestDto, TenantSettingDto, TenantSystemHealthSettingsDto } from '@eleon/contracts.lib'
import { TenantSettingsService } from '../proxy'
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class TenantSettingService extends ITenantSettingService {
  private proxy = new TenantSettingsService();

  getSettingsByTenantId(tenantId: string) : Observable<TenantSettingDto> {
    return this.proxy.getTenantSettingsByTenantId(tenantId);
  }

  getSystemHealthSettings() : Observable<TenantSystemHealthSettingsDto> {
    return this.proxy.getTenantSystemHealthSettings();
  }

  updateSystemHealthSettings(request: TenantSystemHealthSettingsDto) : Observable<boolean> {
    return this.proxy.updateTenantSystemHealthSettings(request);
  }

  setExternalProviderSettings(request: SetTenantProviderSettingsRequestDto) : Observable<boolean> {
    return this.proxy.setExternalProviderSettingsByRequest(request);
  }
}