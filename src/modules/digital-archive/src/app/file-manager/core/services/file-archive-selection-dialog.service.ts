import { IFileArchiveSelectionDialogService, ILocalizationService } from '@eleon/angular-sdk.lib';

import { DialogService } from 'primeng/dynamicdialog'
import { FileExplorerView } from '../file-explorer-view.enum'
import { Injectable } from '@angular/core'
import { FileArchiveSelectionComponent } from '../../file-archive-selection/file-archive-selection.component';

@Injectable({
  providedIn: 'root'
})
export class FileArchiveSelectionDialogService extends IFileArchiveSelectionDialogService {
  constructor(private dialogService: DialogService, private localizationService: ILocalizationService) {
    super();
}

  override openArchiveSelection(onFileArchiveSelected: (fileArchive: any) => void): void {
    const ref = this.dialogService.open(FileArchiveSelectionComponent, {
      header: this.localizationService.instant('FileManager::FileArchive:SelectFileArchive'),
      width: '400px',
      height: '200px'
    });
    ref.onClose.subscribe((fileArchive) => {
      if (fileArchive) {
        onFileArchiveSelected(fileArchive);
      }
    });
  }
}