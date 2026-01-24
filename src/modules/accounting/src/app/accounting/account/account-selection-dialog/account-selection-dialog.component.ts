
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountStatus } from '@eleon/accounting-proxy';
import { AccountListRequestType } from '@eleon/accounting-proxy';
import { AccountService } from '@eleon/accounting-proxy';
import { AccountHeaderDto } from '@eleon/accounting-proxy';
import { LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';

import { IPermissionService, ILocalizationService } from '@eleon/angular-sdk.lib';
interface AccountTableRow {
  data: AccountHeaderDto;
}
@Component({
  standalone: false,
  selector: 'app-account-selection-dialog',
  templateUrl: './account-selection-dialog.component.html',
  styleUrls: ['./account-selection-dialog.component.scss']
})
export class AccountSelectionDialogComponent  implements OnInit {
  @Output()
  selectEvent: EventEmitter<AccountHeaderDto> = new EventEmitter<AccountHeaderDto>();

  @Output()
  showDialogChange = new EventEmitter<boolean>();
  @Input()
  public beforeButton: TemplateRef<any>;
  display: boolean = false;
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;

  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: AccountTableRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  localizedAccountStatuses: { status: AccountStatus, name: string }[];
  AccountStatus = AccountStatus;
  creationDateRangeFilter: Date[] = null;
  searchQueryText: string;
  searchQuery: string;
  viewportBreakpoints = viewportBreakpoints;
  requestType: AccountListRequestType = AccountListRequestType.EnRoute;
  title: string;

  constructor(
    public accountService: AccountService,
    public localizationService: ILocalizationService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public permissionService: IPermissionService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.title = this.localizationService.instant('AccountingModule::AccountSelection');
    });

    this.localizedAccountStatuses = Object.keys(AccountStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        status: AccountStatus[name as keyof typeof AccountStatus],
        name: this.localizationService.instant(`AccountingModule::AccountStatus:${name}`),
      }));
  }

  loadAccounts(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || 'CreationTime';
    const sortOrder: string = sortField === 'CreationTime'
      ? 'desc'
      : event.sortOrder > 0 ? 'asc' : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;
    let fromCreationDate = null, toCreationDate = null;
    if (this.creationDateRangeFilter?.length === 2) {
      fromCreationDate = this.creationDateRangeFilter[0]?.toISOString();
      toCreationDate = this.creationDateRangeFilter[1]?.toISOString();
    }

    this.accountService.getByFilterByInput({
      requestType: this.requestType,
      maxResultCount: this.rowsCount,
      skipCount: event.first,
      sorting,
      creationDateFilterEnd: toCreationDate,
      creationDateFilterStart: fromCreationDate,
      initiatorNameFilter: event.filters?.['initiator']?.value,
      searchQuery: this.searchQuery,
      actorRefIdFilter: null,
      actorTypeFilter: null,
      approvalNeededFilter: null,
      accountStatusFilter:event.filters?.['accountStatus']?.value?.map(x => x.status),
      organizationUnitFilter: event.filters?.['organizationUnit']?.value?.map(x => x.id),
    }).subscribe((rows) => {
      this.rows = rows.items.map(i => ({ data: i }));
      this.totalRecords = rows.totalCount;
      this.loading = false;
    });
  }

  reloadAccounts() {
    if (this.lastLoadEvent != null)
      this.loadAccounts(this.lastLoadEvent);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadAccounts(this.lastLoadEvent);
  }

  clear(event) {
    this.searchQueryText = '';
    this.search(event);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadAccounts(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadAccounts(this.lastLoadEvent);
  }

  onShowBtnClick(): void {
    this.changeShowDialog(true);
  }

  changeShowDialog(value: boolean) {
    this.display = value;
    this.showDialogChange.emit(value);
  }

  onSelect(row: AccountTableRow) {
    this.selectEvent.emit(row.data);
    this.changeShowDialog(false);
  }

  showDialog() {
    this.display = true;
  }
}
