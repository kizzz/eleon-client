import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { FileExplorerView } from '../../../../core/file-explorer-view.enum';
import { FileManagerTab } from '../../../../core/file-manager-tab.enum';
import { FileManagerExplorerComponent } from '../../../../file-manager-explorer/file-manager-explorer.component';
import { isFolder } from '../../../../shared/utils/entry-helpers';

@Component({
  standalone: false,
  selector: 'app-file-arhive-folder-selection',
  templateUrl: './file-arhive-folder-selection.component.html',
  styleUrls: ['./file-arhive-folder-selection.component.scss']
})
export class FileArhiveFolderSelectionComponent {
  @Input()
  display: boolean = false;

  @Input()
  storageProviderId: string | null = null;

  @Input()
  selectedFolderId: string | null = null;

  @Output()
  folderSelected = new EventEmitter<FileSystemEntryDto>();

  @Output()
  closeEvent = new EventEmitter<void>();

  @ViewChild(FileManagerExplorerComponent)
  explorer: FileManagerExplorerComponent;

  fileExplorerView = FileExplorerView;
  fileManagerTab = FileManagerTab;

  canSelect(): boolean {
    return !!this.explorer?.selectedFolder?.()?.id;
  }

  confirm(): void {
    const folder = this.explorer?.selectedFolder?.();
    if (folder?.id && isFolder(folder)) {
      this.folderSelected.emit(folder);
    }
    this.onHide();
  }

  onHide(): void {
    this.closeEvent.emit();
  }
}
