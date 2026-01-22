import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackgroundJobStatus } from '@eleon/background-jobs-proxy';
import { FilterMetadata, LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { BackgroundJobService } from '@eleon/background-jobs-proxy';
import { BackgroundJobHeaderDto } from '@eleon/background-jobs-proxy';
import { finalize, Observable } from 'rxjs';
import { BackgroundJobHubService } from '../../backgorund-job-services/background-job-hub.service';

interface BackgroundJobTableRow {
  data: BackgroundJobHeaderDto;
}

@Component({
  standalone: false,
  selector: 'app-background-job-dashboard',
  templateUrl: './background-job-dashboard.component.html',
  styleUrls: ['./background-job-dashboard.component.scss'],
})
export class BackgroundJobDashboardComponent implements OnInit {
  readonly rowsCount: number = 10;
  readonly defaultSortField: string = 'lastExecutionDateUtc';
  readonly defaultSortOrder: string = 'desc';

  totalRecords: number = 0;
  rows: BackgroundJobTableRow[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  localizedBackgroundJobStatuses: {
    jobStatus: BackgroundJobStatus;
    name: string;
  }[];
  BackgroundJobStatus = BackgroundJobStatus;
  searchQuery: string;
  searchQueryText: string;
  viewportBreakpoints = viewportBreakpoints;
  dateRangeFilter: Date[] = null;
  lastExecutionDateRangeFilter: Date[] = null;
  currentSorting: string;

  taskExecutionid: string | null = null;
  readonly filters: { [s: string]: FilterMetadata} = {
  type: { value: '', matchMode: 'in' }
};

  constructor(
    private backroundJobHub: BackgroundJobHubService,
    public backgroundJobService: BackgroundJobService,
    public localizationService: ILocalizationService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.localizedBackgroundJobStatuses = Object.keys(BackgroundJobStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        jobStatus:
          BackgroundJobStatus[name as keyof typeof BackgroundJobStatus],
        name: this.localizationService.instant(
          `Infrastructure::BackgroundJobStatus:${name}`
        ),
      }));

    this.route.queryParams.subscribe((params) => {
      this.taskExecutionid = params['taskExecutionid'] || null;
      if (this.taskExecutionid) {
        this.filters['type'].value = this.taskExecutionid;
        this.loadBackgroundJobs(this.lastLoadEvent);
      }
    });

    this.subscribeToJobUpdate();
  }

  get defaultSorting(): string {
    return `${this.defaultSortField} ${this.defaultSortOrder}`;
  }

  loadBackgroundJobs(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || this.defaultSortField;
    const eventSortOrder = event.sortOrder
      ? event.sortOrder > 0
        ? 'asc'
        : 'desc'
      : null;
    const sortOrder: string =
      sortField === this.defaultSortField
        ? eventSortOrder ?? this.defaultSortOrder
        : eventSortOrder;
    const sorting: string = sortField + ' ' + sortOrder;
    this.currentSorting = sorting;

    let fromDate = null,
      toDate = null;
    if (this.dateRangeFilter?.length === 2) {
      fromDate = this.dateRangeFilter[0]?.toLocaleString();
      toDate = this.dateRangeFilter[1]?.toLocaleString();
    }
    if (!fromDate && toDate) {
      fromDate = toDate;
    } else if (fromDate && !toDate) {
      toDate = fromDate;
    }

    let lastExecutionFromDate = null,
      lastExecutionToDate = null;
    if (this.lastExecutionDateRangeFilter?.length === 2) {
      lastExecutionFromDate =
        this.lastExecutionDateRangeFilter[0]?.toLocaleString();
      lastExecutionToDate =
        this.lastExecutionDateRangeFilter[1]?.toLocaleString();
    }

    if (!lastExecutionFromDate && lastExecutionToDate) {
      lastExecutionFromDate = lastExecutionToDate;
    } else if (lastExecutionFromDate && !lastExecutionToDate) {
      lastExecutionToDate = lastExecutionFromDate;
    }
    this.backgroundJobService
      .getBackgroundJobList({
        maxResultCount: this.taskExecutionid ? 1000 : this.rowsCount,
        skipCount: event.first,
        sorting,
        typeFilter: event.filters?.['type']?.value,
        searchQuery: this.searchQuery,
        statusFilter: event.filters?.['status']?.value,
        objectTypeFilter: event.filters?.['moduleObjectType']?.value,
        creationDateFilterEnd: toDate,
        creationDateFilterStart: fromDate,
        lastExecutionDateFilterStart: lastExecutionFromDate,
        lastExecutionDateFilterEnd: lastExecutionToDate,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((rows) => {
        this.rows = rows.items.map((i) => ({ data: i }));
        this.totalRecords = rows.totalCount;
      });
  }

  isFiltersEmpty(): boolean {
    return (
      this.isSearchQueryEmpty() &&
      this.isTypeFilterEmpty() &&
      this.isDocTypeFilterEmpty() &&
      this.isCreationTimeFilterEmpty() &&
      this.isLastExecutionTimeFilterEmpty() &&
      this.isStatusFilterEmpty()
    );
  }

  isSearchQueryEmpty(): boolean {
    return (
      this.searchQuery !== undefined ||
      this.searchQuery !== null ||
      this.searchQuery !== ''
    );
  }

  isTypeFilterEmpty(): boolean {
    return !this.lastLoadEvent?.filters?.['type']?.['value']?.map((x) => x.type)
      ?.length;
  }

  isDocTypeFilterEmpty(): boolean {
    return !this.lastLoadEvent?.filters?.['moduleObjectType']?.['value']?.map(
      (x) => x.moduleObjectType
    )?.length;
  }

  isCreationTimeFilterEmpty(): boolean {
    return !this.dateRangeFilter?.length;
  }

  isLastExecutionTimeFilterEmpty(): boolean {
    return !this.lastExecutionDateRangeFilter?.length;
  }

  isStatusFilterEmpty(): boolean {
    return !this.lastLoadEvent?.filters?.['status']?.['value']?.map(
      (x) => x.jobStatus
    )?.length;
  }

  getBackgroundJobStatusName(status: number) {
    return this.localizationService.instant(
      'Infrastructure::BackgroundJobStatus:' + BackgroundJobStatus[status]
    );
  }

  getBackgroundJobTypeName(type: number) {
    return this.localizationService.instant(
      'Infrastructure::BackgroundJobTypes:' + type
    );
  }

  getDocumentObjectTypeName(type: any) {
    return type;
  }

  reloadBackgroundJobs() {
    if (this.lastLoadEvent != null) this.loadBackgroundJobs(this.lastLoadEvent);
  }

  select(event) {
    const row = event.data;
    this.router.navigate(['/background-job/details', row.data.id]);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.loadBackgroundJobs(this.lastLoadEvent);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.loadBackgroundJobs(this.lastLoadEvent);
      }
      return;
    }
    this.searchQuery = this.searchQueryText;
    this.loadBackgroundJobs(this.lastLoadEvent);
  }

  getEmptyMessage(): string {
    let msg = 'BackgroundJob::List:Empty';
    let counter = 0;
    if (!this.isTypeFilterEmpty()) {
      counter++;
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedType'
      );
    }
    if (!this.isDocTypeFilterEmpty()) {
      counter++;
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedDocType'
      );
    }

    if (!this.isStatusFilterEmpty()) {
      counter++;
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedStatuses'
      );
    }
    if (this.dateRangeFilter?.length === 2) {
      counter++;
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedCreationDates'
      );
    }
    if (this.lastExecutionDateRangeFilter?.length === 2) {
      counter++;
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedLastExecutionTimeDates'
      );
    }
    if (counter > 1) {
      msg = this.localizationService.instant(
        'BackgroundJob::NoRowsBySelectedParams'
      );
    }

    return msg;
  }

  getEndTime(startTime, endTime) {
    if (startTime && endTime && startTime <= endTime) {
      return endTime;
    } else {
      return new Date();
    }
  }
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }

  private subscribeToJobUpdate(): void {
    this.backroundJobHub.backgroundJobCompleted$.subscribe((job) => {
      this.rows = this.rows.map((row) => {
        if (row.data.id === job.id) {
          row.data = { ...row.data, ...job };
        }
        return row;
      });
    });
  }

  calculateTotalByCount(jobStatus: BackgroundJobStatus): number {
    return this.rows.filter((row) => row.data.status === jobStatus).length;
  }
}
