import { FileManagerUploadService } from '../core/services/file-manager-upload.service';
import { FileManagerDetailsService } from '../core/services/file-manager-details.service';
import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { FileUploadService } from '../core/file-upload.service';
import { ArchiveManagerService } from '../core/services/archive-manager.service';

export interface FileDropEntry {
  file: any;
  currentIndex: number;
  totalLength: number;
  onlyFile: boolean;
}

@Directive({
  standalone: false,
  selector: '[appDragDrop]',
})
export class FileDragDropDirective {
  archiveId = this.archiveManager.readonlySelectedArchiveId;

  constructor(
    private el: ElementRef,
    private archiveManager: ArchiveManagerService,
    private renderer: Renderer2,
    private fileUploadService: FileUploadService,
    private fileManagerDetailsService: FileManagerDetailsService,
    private fileManagerUploadService: FileManagerUploadService
  ) {}

  fileOver: boolean = false;
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    this.renderer.addClass(this.el.nativeElement, 'mat-elevation-z8');
    // Dragover listener @HostListener('dragover', ['$event']) onDragover (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    // Dragleave listener @HostListener('dragleave', ['$event']) public onDragLeave (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.renderer.removeClass(this.el.nativeElement, 'mat-elevation-z8');
  }

  @HostListener('drop', ['$event'])
  async onDrop($event) {
    $event.preventDefault();
    $event.stopPropagation();

    const items = $event.dataTransfer?.items;
    if (!items) return;

    const files = await this.getFilesFromDataTransferItems(items);

    // TODO hierarchy uploading
    this.fileUploadService.upload(
      files,
      this.fileManagerDetailsService.currentFolderDetails().id,
      this.archiveId()
    );
  }

  async getFilesFromDataTransferItems(
    items: DataTransferItemList
  ): Promise<File[]> {
    const files: File[] = [];

    const promises: Promise<File[]>[] = [];

    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const entry = (item as any).webkitGetAsEntry?.();
        if (entry) {
          promises.push(this.traverseFileTree(entry));
        } else {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    }

    const results = await Promise.all(promises);
    return [...files, ...results.flat()];
  }

 async traverseFileTree(entry: any, path = ''): Promise<File[]> {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file: File) => {
        // manually patch the relative path
        Object.defineProperty(file, 'webkitRelativePath', {
          value: path + file.name,
          writable: false,
        });
        resolve([file]);
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries: any[] = [];

      const readEntries = () => {
        dirReader.readEntries(async (batch: any[]) => {
          if (!batch.length) {
            const nestedFiles = await Promise.all(
              entries.map((ent) => this.traverseFileTree(ent, path + entry.name + '/'))
            );
            resolve(nestedFiles.flat());
          } else {
            entries.push(...batch);
            readEntries();
          }
        });
      };

      readEntries();
    } else {
      resolve([]);
    }
  });
}

}
