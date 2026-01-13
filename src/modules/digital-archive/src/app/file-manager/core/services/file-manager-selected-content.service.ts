import { FileManagerViewSettingsService } from './file-manager-view-settings.service';
import { effect, Injectable } from '@angular/core';
import { FileManagerDetailsService } from './file-manager-details.service';
import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { isFile } from '../../shared/utils/entry-helpers';

interface ContentItemId {
  id: string,
  isFile: boolean,
}

@Injectable()
export class FileManagerSelectedContentService {
  
  public selectedItemsIds : ContentItemId[] = [];

  constructor(
    private fileManagerDetailsService: FileManagerDetailsService,
    private FileManagerViewSettingsService: FileManagerViewSettingsService,

  ) {
    effect(() => {
      FileManagerViewSettingsService.readonlyCurrentFolderId();
      this.selectedItemsIds = [];
      
    }, { allowSignalWrites:true });
    effect(() => {
      const checkAll = FileManagerViewSettingsService.checkAll();
      if (checkAll === true) {
        const allEntries: FileSystemEntryDto[] = this.fileManagerDetailsService.currentFolderContentEntries() ?? [];
        this.selectedItemsIds = allEntries.map<ContentItemId>(entry => ({
          id: entry.id ?? '',
          isFile: isFile(entry)
        }));
      } else if (checkAll === false) {
        this.selectedItemsIds = [];
      }
    })
  }

  /**
   * Add or remove a selected item by entry
   * @param entry The FileSystemEntryDto to add/remove
   */
  public addOrRemoveSelectedEntry(entry: FileSystemEntryDto) {
    if (!entry?.id) {
      return;
    }
    const isFileEntry = isFile(entry);
    this.addOrRemoveSelectedItem(entry.id, isFileEntry);
  }

  /**
   * Add or remove a selected item by id and type
   * @param id The entry id
   * @param isFile Whether the entry is a file
   */
  public addOrRemoveSelectedItem(id: string, isFile: boolean) {
    if (this.selectedItemsIds.find(item => item.id == id && item.isFile == isFile)) {
      this.selectedItemsIds = this.selectedItemsIds.filter(item => !(item.id == id && item.isFile == isFile));
    } else {
      this.selectedItemsIds.push(({id: id, isFile: isFile}));
    }
  }

  /**
   * Get all selected entries as FileSystemEntryDto array
   */
  public getSelectedEntries(): FileSystemEntryDto[] {
    const allEntries: FileSystemEntryDto[] = this.fileManagerDetailsService.currentFolderContentEntries() ?? [];
    return allEntries.filter(entry => 
      this.selectedItemsIds.some(item => item.id == entry.id && item.isFile === isFile(entry))
    );
  }

  /**
   * Get selected file entries
   */
  public getSelectedFiles(): FileSystemEntryDto[] {
    return this.getSelectedEntries().filter(isFile);
  }

  /**
   * Get selected folder entries
   */
  public getSelectedFolders(): FileSystemEntryDto[] {
    return this.getSelectedEntries().filter(entry => !isFile(entry));
  }

  public resetSelectedItems() {
    this.selectedItemsIds = [];
    this.FileManagerViewSettingsService.checkAll.set(null);
  }
}
