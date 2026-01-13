import { Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { DataService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CommonTenantDto, TenantQueryingService } from '../../proxy';

@Component({
  standalone: false,
  selector: 'app-tenant-table-box',
  templateUrl: './tenant-table-box.component.html',
  styleUrls: ['./tenant-table-box.component.scss']
})
export class TenantSelectionBoxComponent implements OnInit, OnChanges {
  tenants: CommonTenantDto[];
  totalRecords: number;
  loading: boolean;
  selectAll: boolean = false;
  filter: string;
  rows: number = 5;
  selectedTenants: CommonTenantDto[] = [];

	lastLoadEvent: LazyLoadEvent | null;

  @Input()
  isMultiple: boolean = false;

  @Output()
  selectEvent: EventEmitter<CommonTenantDto[]> = new EventEmitter<CommonTenantDto[]>();
  @Input()
  currentSelectionMode: string = 'multiple';

	@Input()
	ignoredTenants: CommonTenantDto[] = [];

  constructor(
    private tenantService: TenantQueryingService,
    public messageService: MessageService,
    public configService: IApplicationConfigurationManager,
    public localizationService: ILocalizationService,
    private dataService: DataService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) { 
    this.dataService.fieldToClear$.subscribe(value => {
      if(value){
        this.selectedTenants = [];
      }
    });

    if (this.dialogConfig){
      this.ignoredTenants = this.dialogConfig.data.ignoredTenants || [];
      this.isMultiple = this.dialogConfig.data.isMultiple || false;
      this.currentSelectionMode = this.isMultiple ? 'multiple' : 'single';
      this.selectedTenants = this.dialogConfig.data.selectedTenants || [];

      if (this.dialogConfig.data.onSelect && typeof this.dialogConfig.data.onSelect === 'function'){
        this.selectEvent.subscribe(this.dialogConfig.data.onSelect);
      }
    }
  }
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['ignoredTenants']) {
			this.onLoadTenants(this.lastLoadEvent);
		}
	}

  ngOnInit(): void {
    this.loading = true;
  }

  onLoadTenants(event: LazyLoadEvent) {
		this.lastLoadEvent = event;
		this.loading = true;

    this.tenantService.getCommonTenantList({
      maxResultCount: this.rows,
      skipCount: event?.first,
      sorting: '1',
      filter: event?.globalFilter,
    }).subscribe({
      next: paged => {
        this.totalRecords = paged.length;
        this.tenants = this.filterIgnoredTenants(paged || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private filterIgnoredTenants(list: CommonTenantDto[]): CommonTenantDto[] {
    if (!this.ignoredTenants?.length) {
      return list;
    }

    const ignoredIds = new Set(this.ignoredTenants.map(tenant => tenant.id));
    return list.filter(tenant => !ignoredIds.has(tenant.id));
  }

  selectTenants(event: CommonTenantDto[]) {
    if (!event) {
      return;
    }

    if (!Array.isArray(this.selectedTenants)) {
      this.selectedTenants = [this.selectedTenants];
    }

    this.selectEvent.emit(this.selectedTenants);
  }
}
