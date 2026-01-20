import { IFileExplorerDialogService, ILocalizationService } from '@eleon/angular-sdk.lib';

import { DialogService } from 'primeng/dynamicdialog'
import { FileManagerExplorerComponent } from '../../file-manager-explorer/file-manager-explorer.component'
import { FileExplorerView } from '../file-explorer-view.enum'
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class FileExplorerDialogService extends IFileExplorerDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
}

  override openExplorer(archiveId: string, onlyExplorer: boolean = true): void {
    this.dialogService.open(FileManagerExplorerComponent, {
      header: this.localizationService.instant('StorageModule::ExploreStorage'),
      data: {
        archiveId: archiveId,
        viewMode: onlyExplorer ? FileExplorerView.OnlyExplorer : FileExplorerView.Full
      },
      closable: true,
      width: '40vw',
      height: '80vh'
    });
  }
}