import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { PackageTemplateService } from '@eleon/accounting-proxy';
import { PackageTemplateDto } from '@eleon/accounting-proxy';
import { BillingPeriodType } from '@eleon/accounting-proxy';
import { LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';

interface PackageTemplateTableRow {
  data: PackageTemplateDto;
}

@Component({
  standalone: false,
  selector: 'app-package-template-selection-dialog',
  templateUrl: './package-template-selection-dialog.component.html',
  styleUrls: ['./package-template-selection-dialog.component.scss']
})
export class PackageTemplateSelectionDialogComponent implements OnInit {
  @Input()
  public beforeButton: TemplateRef<any>;
  display: boolean = false;
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  
  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: PackageTemplateTableRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  searchQueryText: string;
  searchQuery: string;
  viewportBreakpoints = viewportBreakpoints;
  title: string;

  @Output()
  selectEvent: EventEmitter<PackageTemplateDto> = new EventEmitter<PackageTemplateDto>();

  @Output()
  showDialogChange = new EventEmitter<boolean>();

  constructor(
    public packageTemplateService: PackageTemplateService,
    public localizationService: ILocalizationService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.title = this.localizationService.instant('AccountingModule::TemplateSelection');
  }

  loadPackageTemplates(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || 'CreationTime';
    const sortOrder: string = sortField === 'CreationTime'
      ? 'desc'
      : event.sortOrder > 0 ? 'asc' : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;

    let fromCreationDate = null, toCreationDate = null;
    this.packageTemplateService.getPackageTemplateListByInput({
      maxResultCount: this.rowsCount,
      skipCount: event.first,
      sorting,
      dateFilterStart: fromCreationDate,
      dateFilterEnd: toCreationDate,
      searchQuery: this.searchQuery,
      billingPeriodTypeFilter: null
    }).subscribe((reply) => {      
      this.rows = reply?.items?.map(i => ({ data: i }));;;
      this.totalRecords = reply?.totalCount;
      this.loading = false;
    });
  }

  reloadPackageTemplates() {
    if (this.lastLoadEvent != null)
      this.loadPackageTemplates(this.lastLoadEvent);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadPackageTemplates(this.lastLoadEvent);
  }

  clear(event) {
    this.searchQueryText = '';
    this.search(event);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadPackageTemplates(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadPackageTemplates(this.lastLoadEvent);
  }

  onShowBtnClick(): void {
    this.changeShowDialog(true);
  }

  changeShowDialog(value: boolean) {
    this.display = value;
    this.showDialogChange.emit(value);
  }

  onSelect(row: PackageTemplateTableRow) {
    this.selectEvent.emit(row.data);
    this.changeShowDialog(false);
  }

  showDialog() {
    this.display = true;
  }

  getBillingPeriodTypeName(type: number){
    return this.localizationService.instant('Infrastructure::BillingPeriodType:' + BillingPeriodType[type]);
  }
}
