import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DataService } from '@eleon/primeng-ui.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { TenantHostnameDto, DomainSettingsService } from '@eleon/eleoncore-multi-tenancy-proxy';

@Component({
  standalone: false,
  selector: 'app-tenant-domains-table-box',
  templateUrl: './tenant-domains-table-box.component.html',
  styleUrls: ['./tenant-domains-table-box.component.scss']
})
export class TenantDomainsTableBoxComponent implements OnInit {
  tenantDomains: TenantHostnameDto[] = [];
  filteredTenantDomains: TenantHostnameDto[] = [];
  loading: boolean;
  filter: string;
  selectedTenantDomains: TenantHostnameDto[] = [];

  @Input()
  isMultiple: boolean = false;

  @Output()
  selectEvent: EventEmitter<TenantHostnameDto[]> = new EventEmitter<TenantHostnameDto[]>();

  @Input()
  currentSelectionMode: string = 'multiple';

  @Input()
  ignoredTenantDomains: TenantHostnameDto[] = [];

  constructor(
    public domainSettingsService: DomainSettingsService,
    public localizationService: ILocalizationService,
    private dataService: DataService,
    @Optional() private dialogConfig: DynamicDialogConfig
  ) { 
    this.dataService.fieldToClear$.subscribe(value => {
      if(value){
        this.selectedTenantDomains = [];
      }
    });

    if (this.dialogConfig){
      this.ignoredTenantDomains = this.dialogConfig.data.ignoredTenantDomains || [];
      this.isMultiple = this.dialogConfig.data.isMultiple || false;
      this.currentSelectionMode = this.isMultiple ? 'multiple' : 'single';
      this.selectedTenantDomains = this.dialogConfig.data.selectedTenantDomains || [];

      if (this.dialogConfig.data.onSelect && typeof this.dialogConfig.data.onSelect === 'function'){
        this.selectEvent.subscribe(this.dialogConfig.data.onSelect);
      }
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadTenantDomains();
  }

  loadTenantDomains() {
    this.domainSettingsService.getCurrentTenantHostnames()
      .subscribe(domains => {
        // Filter ignored domains
        let filteredDomains = domains;
        if (this.ignoredTenantDomains?.length > 0) {
          const ignoredIds = this.ignoredTenantDomains.map(d => d.id);
          filteredDomains = domains.filter(d => !ignoredIds.includes(d.id));
        }

        this.tenantDomains = filteredDomains;
        this.filteredTenantDomains = filteredDomains;
        this.loading = false;
      });
  }

  onFilter(event: any) {
    const filter = event.target.value?.toLowerCase() || '';
    if (!filter) {
      this.filteredTenantDomains = this.tenantDomains;
      return;
    }

    this.filteredTenantDomains = this.tenantDomains.filter(d => 
      d.domain?.toLowerCase().includes(filter) ||
      d.url?.toLowerCase().includes(filter) ||
      d.hostname?.toLowerCase().includes(filter)
    );
  }

  selectTenantDomains(event: TenantHostnameDto[]) {
    if (!event) {
      return;
    }

    if (!Array.isArray(this.selectedTenantDomains)) {
      this.selectedTenantDomains = [this.selectedTenantDomains];
    }

    this.selectEvent.emit(this.selectedTenantDomains);
  }

  getProtocol(domain: TenantHostnameDto): string {
    return domain.isSsl ? 'https://' : 'http://';
  }
}
