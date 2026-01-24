import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountStatus } from '@eleon/accounting-proxy';
import { AccountListRequestType } from '@eleon/accounting-proxy';
import { AccountService } from '@eleon/accounting-proxy';
import { AccountHeaderDto } from '@eleon/accounting-proxy';
import { LazyLoadEvent } from 'primeng/api';
import { CommonOrganizationUnitDto, IOrganizationUnitService } from '@eleon/angular-sdk.lib';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';

import {
  IPermissionService,
  ILocalizationService,
} from '@eleon/angular-sdk.lib';
interface AccountTableRow {
  data: AccountHeaderDto;
}

@Component({
  standalone: false,
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
})
export class AccountDashboardComponent implements OnInit {
  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: AccountTableRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  localizedAccountStatuses: { status: AccountStatus; name: string }[];
  AccountStatus = AccountStatus;
  creationDateRangeFilter: Date[] = null;
  searchQueryText: string;
  searchQuery: string;
  viewportBreakpoints = viewportBreakpoints;
  requestType: AccountListRequestType = AccountListRequestType.EnRoute;
  title: string;
  organizationUnits: CommonOrganizationUnitDto[];
  moduleType: string = 'Account';
  activeIndex: number = 0;
  showAccountCreateDialog: boolean = false;

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      show: () => true,
      loading: () => this.loading,
      action: () => this.reloadAccounts(),
      disabled: () => this.loading,
    }),
    PAGE_CONTROLS.CREATE({
      show: () => this.isAccountModule(),
      loading: () => this.loading,
      action: () => this.create(),
      disabled: () => this.loading,
    }),
  ]);

  constructor(
    public accountService: AccountService,
    public localizationService: ILocalizationService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public orgUnitService: IOrganizationUnitService,
    public permissionService: IPermissionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.moduleType = data['module'];
      this.requestType = data['requestType'];

      if (this.moduleType == 'Account') {
        switch (this.requestType) {
          case AccountListRequestType.Archive:
            this.activeIndex = 2;
            this.cdr.detectChanges();
            break;
          case AccountListRequestType.ActionRequired:
            this.activeIndex = 1;
            this.cdr.detectChanges();
            break;
          default:
            this.activeIndex = 0;
            this.cdr.detectChanges();
            break;
        }
      }

      switch (this.requestType) {
        case AccountListRequestType.Archive:
          this.title = this.localizationService.instant(
            'AccountingModule::Archive:Title'
          );
          break;
        case AccountListRequestType.ActionRequired:
          this.title = this.localizationService.instant(
            'AccountingModule::ApprovalList:Title'
          );
          break;
        default:
          this.title = this.localizationService.instant(
            'AccountingModule::Dashboard:Title'
          );
          break;
      }
      this.orgUnitService
        .getAvailableForUser()
        .subscribe(
          (res) => (this.organizationUnits = res.map((x) => x.organizationUnit))
        );
    });

    this.localizedAccountStatuses = Object.keys(AccountStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        status: AccountStatus[name as keyof typeof AccountStatus],
        name: this.localizationService.instant(
          `AccountingModule::AccountStatus:${name}`
        ),
      }));
  }

  onChange({ index }: { index: number }) {
    if (index === 0) {
      this.router.navigate(['account/dashboard']);
    } else if (index === 1) {
      this.router.navigate(['account/approval']);
    } else if (index === 2) {
      this.router.navigate(['account/archive']);
    }
  }

  loadAccounts(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || 'CreationTime';
    const sortOrder: string =
      sortField === 'CreationTime'
        ? 'desc'
        : event.sortOrder > 0
        ? 'asc'
        : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;
    let fromCreationDate = null,
      toCreationDate = null;
    if (this.creationDateRangeFilter?.length === 2) {
      fromCreationDate = this.creationDateRangeFilter[0]?.toISOString();
      toCreationDate = this.creationDateRangeFilter[1]?.toISOString();
    }
    this.accountService
      .getByFilterByInput({
        requestType: this.requestType,
        maxResultCount: this.rowsCount,
        skipCount: event.first,
        sorting,
        creationDateFilterEnd: toCreationDate,
        creationDateFilterStart: fromCreationDate,
        // documentStatusFilter removed - use accountStatusFilter instead
        // accountTypeFilter removed - not available in AccountListRequestDto
        searchQuery: this.searchQuery,
        actorRefIdFilter: null,
        actorTypeFilter: null,
        approvalNeededFilter: null,
        accountStatusFilter: event.filters?.['accountStatus']?.value?.map(
          (x) => x.status
        ),
        // resellerTypeFilter removed - not available in AccountListRequestDto
        organizationUnitFilter: event.filters?.['organizationUnit']?.value?.map(
          (x) => x.id
        ),
      })
      .subscribe((rows) => {
        this.rows = rows.items.map((i) => ({ data: i }));
        this.totalRecords = rows.totalCount;
        this.loading = false;
      });
  }

  reloadAccounts() {
    if (this.lastLoadEvent != null) this.loadAccounts(this.lastLoadEvent);
  }

  select(event) {
    const row = event.data;
    if (row?.data?.accountStatus == AccountStatus.New) {
      this.router.navigate(['/account/create', row.data.id]);
    } else{
      this.router.navigate(['/account/details', row.data.id]);
    }
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

  isArchive() {
    return this.requestType == AccountListRequestType.Archive;
  }

  isAccountManager(): boolean {
    return this.permissionService.getGrantedPolicy(
      'Permission.Account.AccountManager'
    );
  }

  isHost(): boolean {
    return this.permissionService.getGrantedPolicy('VPortal.Dashboard.Host');
  }

  isAccountModule(): boolean {
    return this.moduleType === 'Account';
  }

  create() {
    if (this.isAccountModule()) {
      this.showAccountCreateDialog = true;
    }
  }

  onAccountCreated(accountId: string): void {
    this.showAccountCreateDialog = false;
    this.router.navigate(['/account/create', accountId]);
  }
  
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
