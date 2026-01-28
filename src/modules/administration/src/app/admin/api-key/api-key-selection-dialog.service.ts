
import { DialogService } from 'primeng/dynamicdialog'
import { Injectable } from '@angular/core'
import { ApiKeySelectionDialogConfig, IApiKeySelectionDialogService, ILocalizationService } from '@eleon/contracts.lib';
import { ApiKeyTableBoxComponent } from './api-key-table-box/api-key-table-box.component';

@Injectable({
  providedIn: 'root'
})
export class ApiKeySelectionDialogService extends IApiKeySelectionDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
}

  override openApiKeySelection(config: ApiKeySelectionDialogConfig): void {
    const ref = this.dialogService.open(ApiKeyTableBoxComponent, {
      header: (config.title || this.localizationService.instant('TenantManagement::ApiKeys:SelectApiKey')),
      width: '600px',
      closable: true,
      data: {
        selectedApiKeys: config.selectedApiKeys,
        ignoredApiKeys: config.ignoredApiKeys,
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