import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { Component, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';
import {
  IAuthManager,
  ILifecycleService,
  ILocalizationService,
  IPermissionService,
} from '@eleon/angular-sdk.lib';
import { LazyLoadEvent } from 'primeng/api';
import {
  LifecycleManagerService,
  StatesGroupAuditReportDto,
  StatesGroupAuditService,
  StatesGroupAuditTreeDto,
} from '@eleon/lifecycle-feature-proxy';
import { LifecycleStatus } from '@eleon/contracts.lib';
import { TraceCardMode } from '../../lifecycle/lifecycle-trace';

@Component({
  standalone: false,
  selector: 'app-lifecycle-report-page',
  templateUrl: './lifecycle-report-page.component.html',
  styleUrls: ['./lifecycle-report-page.component.scss'],
})
export class LifecycleReportPage {
  loading = false;
  lastLoadEvent: LazyLoadEvent | null = null;
  rowsCount: number = 10;
  totalRecords = 0;

  allDocuments: StatesGroupAuditReportDto[] = [];
  preparedDocuments: StatesGroupAuditReportDto[] = [];
  selectedDocument: StatesGroupAuditReportDto = null;
  selectedReportForDetails: StatesGroupAuditReportDto = null;
  showDetailsDialog = false;
  statesGroupTemplateId: string | null = null;

  isMultiCompany: boolean = false;
  // selectedCompany: CompanyOrganizationUnitDto = null;
  statesGroupAuditTree: StatesGroupAuditTreeDto = null;

  organizationUnits: string[] = [];
  docTypes: string[] = [];
  roles: string[] = [];
  companies: string[] = [];

  dateRangeFilter: Date[] = null;
  orgUnitsFilter: string[];
  moduleTypeFilter: string[] = null;
  rolesFilter: string[] = null;
  companiesFilter: string[] = null;

  searchQueryText: string;
  searchQuery: string;
  // viewportBreakpoints = viewportBreakpoints;
  // faMagnifyingGlass = faMagnifyingGlass;

  TraceCardMode = TraceCardMode;
  LifecycleStatus = LifecycleStatus;

  get hasLoggedIn() {
    return this.authService.isAuthenticated();
  }

  @PageControls()
  controls = contributeControls([
    PAGE_CONTROLS.RELOAD({
      excludeFromBars: true,
      action: () => this.loadDocs(this.lastLoadEvent),
    }),
  ]);

  constructor(
    private authService: IAuthManager,
    private localizationService: ILocalizationService,
    private lifecycleManager: LifecycleManagerService,
    private permissionService: IPermissionService,
    private statesGroupAuditService: StatesGroupAuditService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.statesGroupTemplateId = params['statesGroupTemplateId'] || null;
      this.loadDocs(this.lastLoadEvent);
    });
  }

  loadDocs(event: LazyLoadEvent | null) {
    this.lastLoadEvent = event;
    this.loading = true;

    const sortField = event?.sortField || 'name';
    const sortOrder = event?.sortOrder == 1 ? 'asc' : 'desc';
    const sorting = sortField + ' ' + sortOrder;

    this.statesGroupAuditService
      .getReportsByInput({
        objectTypeFilter: null,
        maxResultCount: this.rowsCount,
        skipCount: event?.first ?? 0,
        sorting,
        statesGroupTemplateId: this.statesGroupTemplateId || null,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.totalRecords = res.totalCount;
        this.allDocuments = res.items;
        // this.organizationUnits = [...new Set(res.filter(x => x.organizationUnitName !== null).map(x => x.organizationUnitName))];
        // this.docTypes = [...new Set(res.filter(x => x.documentObjectType !== null).map(x => x.documentObjectType))];
        // this.companies = [...new Set(res.filter(x => x.companyName !== null).map(x => x.companyName))];
        // this.roles = [...new Set(res.filter(x => x.role !== null).map(x => x.role))];

        this.prepareDocuments();
      });
  }

  loadStatesGroupAudit() {
	if (!this.selectedDocument) {
      return;
    }
    this.loading = true;
    this.lifecycleManager
      .getTraceByDocumentObjectTypeAndDocId(
        this.selectedDocument.documentObjectType,
        this.selectedDocument.documentId
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.statesGroupAuditTree = res;
      });
  }

  prepareDocuments() {
    this.preparedDocuments = this.allDocuments;

    // if (this.isMultiCompany && this.companiesFilter && this.companiesFilter.length > 0) {
    // 	this.preparedDocuments = this.preparedDocuments.filter(x =>this.companiesFilter.includes(x.companyName));
    // }

    if (this.dateRangeFilter?.length === 1) {
      const selectedDate = new Date(this.dateRangeFilter[0]);
      this.preparedDocuments = this.preparedDocuments.filter((doc) => {
        const docDate = new Date(doc.statusDate);
        return docDate.toDateString() === selectedDate.toDateString();
      });
    } else if (this.dateRangeFilter?.length === 2) {
      const [start, end] = this.dateRangeFilter.map((d) => new Date(d));

      this.preparedDocuments = this.preparedDocuments.filter((doc) => {
        const docDate = new Date(doc.statusDate);
        return docDate >= start && docDate <= end;
      });
    }

    // if (this.orgUnitsFilter && this.orgUnitsFilter.length > 0) {
    // 	this.preparedDocuments = this.preparedDocuments.filter(x =>this.orgUnitsFilter.includes(x.organizationUnitName));
    // }

    if (this.moduleTypeFilter && this.moduleTypeFilter.length > 0) {
      this.preparedDocuments = this.preparedDocuments.filter((x) =>
        this.moduleTypeFilter.includes(x.documentObjectType)
      );
    }

    if (this.rolesFilter && this.rolesFilter.length > 0) {
      this.preparedDocuments = this.preparedDocuments.filter((x) =>
        this.rolesFilter.includes(x.role)
      );
    }
  }

  onMultiCompanyChange(event): void {
    this.loadDocs(this.lastLoadEvent);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
  }

  clear(event) {
    this.searchQueryText = '';
    this.search(event);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
      }
      return;
    }

    this.searchQuery = this.searchQueryText;
  }

  // onRowSelect(row: LifecyclePendingApprovalDto) {
  // 	this.businessSelectionService.setCompany(row.companyId).subscribe(res => {
  // 		if ((res?.errors?.length ?? 0) === 0){
  // 			this.navigationService.navigate(row.documentObjectType, row.documentId);
  // 		}
  // 	});
  // }

  isLifecycleManager() {
    // TODO: return this.permissionService.getGrantedPolicy('LifecycleFeatureModule.LifecycleManager');
  }

  onSelect(event) {
    this.selectedDocument = event?.data;
	this.loadStatesGroupAudit();
  }

  openDetailsDialog(report: StatesGroupAuditReportDto): void {
    this.selectedReportForDetails = report;
    this.showDetailsDialog = true;
  }

  onDetailsDialogHide(): void {
    this.showDetailsDialog = false;
    this.selectedReportForDetails = null;
  }
  getStatusLabel(status?: LifecycleStatus | null): string {
    if (status === null || status === undefined) {
      return this.localizationService.instant('Lifecycle::LifecycleStatus:Unknown');
    }
    return this.localizationService.instant(`Lifecycle::LifecycleStatus:${LifecycleStatus[status]}`);
  }
  
  getStatusColor(status: LifecycleStatus): string {
    if (status === undefined || status === null) {
      return 'secondary';
    }
    switch (status) {
      case LifecycleStatus.New:
        return 'info'; // Blue
      case LifecycleStatus.Enroute:
        return 'warning'; // Yellow
      case LifecycleStatus.Complete:
        return 'success'; // Green
      case LifecycleStatus.Canceled:
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}
