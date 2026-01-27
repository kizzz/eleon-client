import { FileManagerViewSettingsService } from './file-manager-view-settings.service';
import { effect, Injectable } from '@angular/core';
import { FileManagerDetailsService } from './file-manager-details.service';
import { FileSystemEntryDto } from '@eleon/file-manager-proxy';
import { isFile } from '../../shared/utils/entry-helpers';

@Injectable()
export class FileManagerSelectedContentService {
  
  public selectedItemsIds : FileSystemEntryDto[] = [];

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
        const allEntries: FileSystemEntryDto[] = this.fileManagerDetailsService.currentPagedEntries() ?? [];
        this.selectedItemsIds = [...allEntries];
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
    const existingIndex = this.selectedItemsIds.findIndex(item => item.id === entry.id && isFile(item) === isFile(entry));
    if (existingIndex >= 0) {
      this.selectedItemsIds = this.selectedItemsIds.filter((_, index) => index !== existingIndex);
    } else {
      this.selectedItemsIds = [...this.selectedItemsIds, entry];
    }
  }

  /**
   * Add or remove a selected item by id and type
   * @param id The entry id
   * @param isFileEntry Whether the entry is a file
   */
  public addOrRemoveSelectedItem(id: string, isFileEntry: boolean) {
    // Try to find the entry in current paged entries
    const pagedEntries = this.fileManagerDetailsService.currentPagedEntries();
    const entry = pagedEntries.find(e => e.id === id && isFile(e) === isFileEntry);
    
    if (entry) {
      this.addOrRemoveSelectedEntry(entry);
    } else {
      // If entry not found in current page, remove by id if it exists
      this.selectedItemsIds = this.selectedItemsIds.filter(item => !(item.id === id && isFile(item) === isFileEntry));
    }
  }

  /**
   * Get all selected entries as FileSystemEntryDto array
   */
  public getSelectedEntries(): FileSystemEntryDto[] {
    return this.selectedItemsIds;
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
