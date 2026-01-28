
import { DialogService } from 'primeng/dynamicdialog'
import { Injectable } from '@angular/core'
import { ILocalizationService, ITenantDomainsSelectionDialogService, TenantDomainsSelectionDialogConfig } from '@eleon/contracts.lib';
import { TenantDomainsTableBoxComponent } from './tenant-settings/tenant-domains/tenant-domains-table-box/tenant-domains-table-box.component';

@Injectable({
  providedIn: 'root'
})
export class TenantDomainsSelectionDialogService extends ITenantDomainsSelectionDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
}

  override openTenantDomainsSelection(config: TenantDomainsSelectionDialogConfig): void {
    const ref = this.dialogService.open(TenantDomainsTableBoxComponent, {
      header: (config.title || this.localizationService.instant('TenantManagement::TenantSettings:TenantDomains:SelectTenantDomain')),
      width: '600px',
      closable: true,
      data: {
        selectedTenantDomains: config.selectedTenantDomains,
        ignoredTenantDomains: config.ignoredTenantDomains,
        isMultiple: config.isMultiple,
        onSelect: (data) => {
          if (config.onSelect && typeof config.onSelect === 'function') {
            config.onSelect(data);
          }

          ref.close();
        }
      },
    });
  }
}