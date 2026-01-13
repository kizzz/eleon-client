
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StorageProvidersService } from '@eleon/providers-proxy';
import { StorageProviderDto } from '@eleon/providers-proxy';
import { first } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-storage-provider-selection',
  templateUrl: './storage-provider-selection.component.html',
  styleUrls: ['./storage-provider-selection.component.scss'],
})
export class StorageProviderSelectionComponent implements OnInit {
  rows: StorageProviderDto[];
  selected: StorageProviderDto;

  @Output()
  storageProviderSelectionEvent: EventEmitter<StorageProviderDto> =
    new EventEmitter<StorageProviderDto>();
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
    private storageProviderService: StorageProvidersService
  ) {}

  resetToDefault() {
    this.selected = this.rows?.find(r => r.id === this._defaultSelectedId) || this.rows?.find(x => x.id === null);
  }

  ngOnInit(): void {
    this.storageProviderService.getStorageProvidersListByInput({
      maxResultCount: 100,
    })
    .pipe(first())
    .subscribe(list => {
      this.rows = list;
      this.resetToDefault();
    });
    return;
  }

  onSelect(selected: StorageProviderDto) {
    if (selected.id === null) {
      this.storageProviderSelectionEvent.emit(undefined);
    } else {
      this.storageProviderSelectionEvent.emit(selected);
    }

    this.selected = selected;
  }
  edit() {
    this.selected = null;
    //this.storageProviderSelectionEvent.emit(null);
  }
}
