import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { DataService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { ApiKeyService, ApiKeyType, IdentityApiKeyDto } from '@eleon/tenant-management-proxy';

@Component({
  standalone: false,
  selector: 'app-api-key-table-box',
  templateUrl: './api-key-table-box.component.html',
  styleUrls: ['./api-key-table-box.component.scss']
})
export class ApiKeyTableBoxComponent implements OnInit, OnChanges {
  apiKeys: IdentityApiKeyDto[] = [];
  totalRecords: number;
  loading: boolean;
  filter: string;
  rows: number = 5;
  selectedApiKeys: IdentityApiKeyDto[] = [];

  lastLoadEvent: LazyLoadEvent | null;

  @Input()
  isMultiple: boolean = false;

  @Output()
  selectEvent: EventEmitter<IdentityApiKeyDto[]> = new EventEmitter<IdentityApiKeyDto[]>();

  @Input()
  currentSelectionMode: string = 'multiple';

  @Input()
  ignoredApiKeys: IdentityApiKeyDto[] = [];

  constructor(
    public apiKeyService: ApiKeyService,
    public localizationService: ILocalizationService,
    private dataService: DataService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) { 
    this.dataService.fieldToClear$.subscribe(value => {
      if(value){
        this.selectedApiKeys = [];
      }
    });

    if (this.dialogConfig){
      this.ignoredApiKeys = this.dialogConfig.data.ignoredApiKeys || [];
      this.isMultiple = this.dialogConfig.data.isMultiple || false;
      this.currentSelectionMode = this.isMultiple ? 'multiple' : 'single';
      this.selectedApiKeys = this.dialogConfig.data.selectedApiKeys || [];

      if (this.dialogConfig.data.onSelect && typeof this.dialogConfig.data.onSelect === 'function'){
        this.selectEvent.subscribe(this.dialogConfig.data.onSelect);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ignoredApiKeys']) {
      this.onLoadApiKeys(this.lastLoadEvent)
    }
  }

  ngOnInit(): void {
    this.loading = true;
  }

  onLoadApiKeys(event: LazyLoadEvent) {
    this.lastLoadEvent = event;

    this.loading = true;
    this.apiKeyService.getApiKeys({
      keyTypes: [ApiKeyType.SDK, ApiKeyType.External, ApiKeyType.Gateway, ApiKeyType.Custom, ApiKeyType.Undefined]
    }).subscribe(apiKeys => {
      // Filter ignored API keys
      let filteredKeys = apiKeys;
      if (this.ignoredApiKeys?.length > 0) {
        const ignoredIds = this.ignoredApiKeys.map(k => k.id);
        filteredKeys = apiKeys.filter(k => !ignoredIds.includes(k.id));
      }

      // Apply client-side filtering if needed
      if (event?.globalFilter) {
        const filter = event.globalFilter.toLowerCase();
        filteredKeys = filteredKeys.filter(k => 
          k.name?.toLowerCase().includes(filter) ||
          k.type?.toString().toLowerCase().includes(filter)
        );
      }

      // Apply pagination
      const start = event?.first || 0;
      const end = start + this.rows;
      this.totalRecords = filteredKeys.length;
      this.apiKeys = filteredKeys.slice(start, end);
      this.loading = false;
    });
  }

  selectApiKeys(event: IdentityApiKeyDto[]) {
    if (!event) {
      return;
    }

    if (!Array.isArray(this.selectedApiKeys)) {
      this.selectedApiKeys = [this.selectedApiKeys];
    }

    this.selectEvent.emit(this.selectedApiKeys);
  }

  getApiKeyTypeName(type: ApiKeyType): string {
    switch (type) {
      case ApiKeyType.SDK:
        return this.localizationService.instant('TenantManagement::ApiKeyTypes:SDK');
      case ApiKeyType.External:
        return this.localizationService.instant('TenantManagement::ApiKeyTypes:External');
      case ApiKeyType.Gateway:
        return this.localizationService.instant('TenantManagement::ApiKeyTypes:Gateway');
      case ApiKeyType.Custom:
        return this.localizationService.instant('TenantManagement::ApiKeyTypes:Custom');
      case ApiKeyType.Undefined:
        return this.localizationService.instant('TenantManagement::ApiKeyTypes:Undefined');
      default:
        return '';
    }
  }
}
