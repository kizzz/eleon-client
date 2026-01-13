import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { first } from 'rxjs';
import { FileArchiveDto, FileArchiveService } from '@eleon/file-manager-proxy';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: false,
  selector: 'app-file-archive-selection',
  templateUrl: './file-archive-selection.component.html',
  styleUrls: ['./file-archive-selection.component.scss'],
})
export class FileArchiveSelectionComponent implements OnInit {
  rows: FileArchiveDto[];
  selected: FileArchiveDto;

  @Output()
  storageProviderSelectionEvent: EventEmitter<FileArchiveDto> =
    new EventEmitter<FileArchiveDto>();
  @Input()
  readOnly: boolean;
  @Input()
  title: string;
  @Input()
  showWithCard: boolean = true;
  @Input()
  withCardClass: boolean = true;

  private _defaultSelectedId: string;
  @Input() set defaultSelectedId(value: string) {
    this._defaultSelectedId = value;
    this.resetToDefault();
  }

  get defaultSelectedId(): string {
    return this._defaultSelectedId;
  }

  constructor(
    private localizationService: ILocalizationService,
    private dialogRef: DynamicDialogRef,
    private fileArchiveService: FileArchiveService
  ) {}

  resetToDefault() {
    this.selected = this.rows?.find(r => r.id === this._defaultSelectedId) || this.rows?.find(x => x.id === null);
  }

  ngOnInit(): void {
    this.fileArchiveService.getFileArchivesList({
      maxResultCount: 100,
    })
    .pipe(first())
    .subscribe(list => {
      this.rows = list;
      this.resetToDefault();
    });
    return;
  }

  onSelect(selected: FileArchiveDto) {
    if (selected.id === null) {
      this.storageProviderSelectionEvent.emit(undefined);
    } else {
      this.storageProviderSelectionEvent.emit(selected);
    }

    this.selected = selected;
    this.dialogRef.close(selected);
  }
}
