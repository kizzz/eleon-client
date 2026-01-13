import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FileArchiveHierarchyType } from '@eleon/file-manager-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { VPortalOption } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-file-hierarchy-type-selection',
  templateUrl: './file-hierarchy-type-selection.component.html',
  styleUrls: ['./file-hierarchy-type-selection.component.scss']
})
export class FileHierarchyTypeSelectionComponent  implements OnChanges{
  rows: VPortalOption<FileArchiveHierarchyType>[] | null | undefined;
  selected: VPortalOption<FileArchiveHierarchyType> | null | undefined;
  selectedName: string | null | undefined;

  @Input()
  disabled: boolean | null | undefined;
  @Input()
  minimal: boolean | null | undefined;
  @Input()
  isRequired: boolean | null | undefined;
  @Input()
  isInvalid: boolean | null | undefined;
  @Input()
  defaultSelected: string | null | undefined;
  @Output()
  selectionEvent: EventEmitter<VPortalOption<FileArchiveHierarchyType>> = new EventEmitter<VPortalOption<FileArchiveHierarchyType>>();
  @Output()
  disabledClickEvent: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Input()
  readOnly: boolean | null | undefined;
  @Input()
  title: string | null | undefined;
  @Input()
  defaultSelectedOption: VPortalOption<FileArchiveHierarchyType> | null | undefined;
  @Input()
  alwaysEditable: boolean | null | undefined;
  @Input()
  defaultId: string | null | undefined;
  @Input()
  loading = false;
  @Input()
  unitUid: string | null | undefined;
  @Input()
  organizationUnitId: string | null | undefined;
  
  @Input()
  defaultSelectedValue!: FileArchiveHierarchyType;

  get entityName(): string {
    return this.selected.name;
  }
  get entityId(): string {
    return this.selected?.value?.toString();
  }

  constructor(
    public localizationService: ILocalizationService,
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultSelectedValue']) {
      this.input();
    }
  }

  input(): void {
    this.loadRows();
    if (this.defaultSelectedValue != null) {
      this.defaultSelectedOption = this.rows.find(r => r.value == this.defaultSelectedValue);
    }
    if (this.defaultSelectedOption != null) {
      this.selected = this.defaultSelectedOption;
      this.selectedName = this.selected.name;
      return;
    }
    if (this.defaultSelected != null) {
      this.selectedName = FileArchiveHierarchyType[this.defaultSelected];
      return;
    }
    if (!this.rows?.length) {
      this.loadRows();
    }
  }

  loadRows(): void {
    this.rows = Object.entries(FileArchiveHierarchyType)
      .filter(entry => isNaN(parseInt(entry[0])))
      .map(entry => ({
        name: this.localizationService.instant(`FileManager::HierarchyType:${entry[0]}`),
        value: entry[1] as FileArchiveHierarchyType
      }));
    return;
  }

  click(event: any) {
    if (!this.disabled) {
      return;
    }
    this.disabledClickEvent.emit(event);
  }

  onSelect() {
    this.selectedName = this.entityName;
    // if(this.defaultId == null || this.defaultId != this.entityId ) {
      this.selectionEvent.emit(this.selected);
    // }
  }
}
