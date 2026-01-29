import { Injectable } from '@angular/core'
import { ILocalizationService, IProvidersService, StorageProviderDto } from '@eleon/angular-sdk.lib'
import { DialogService } from 'primeng/dynamicdialog';
import { StorageProviderSelectionComponent } from '../storage-provider-selection'

@Injectable({
  providedIn: 'root',
})
export class ProvidersService implements IProvidersService {

  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    
  }

  openProviderSelectionDialog(selectedId: string, onSelect: (provider: StorageProviderDto) => void): void {
    const ref = this.dialogService.open(StorageProviderSelectionComponent, {
      header: this.localizationService.instant('StorageModule::SelectStorageProvider'),
      width: '500px',
      closable: true,
      data: {
        selectedId: selectedId,
        onSelect: (provider: StorageProviderDto) => {
          ref.close();
          onSelect(provider);
        }
      }
    })
  }
}