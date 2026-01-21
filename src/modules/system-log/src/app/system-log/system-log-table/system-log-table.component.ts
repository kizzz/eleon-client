import {
  Component,
  Input,
  OnChanges,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FullSystemLogDto,
  SystemLogDto,
  SystemLogLevel,
  SystemLogService,
} from '@eleon/system-log-proxy';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';
import { finalize, first } from 'rxjs';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import {
  contributeControls,
  LocalizedConfirmationService,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { ExtendedSystemLogDto } from './system-log-table.models';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-system-log-table',
  templateUrl: './system-log-table.component.html',
  styleUrls: ['./system-log-table.component.scss'],
})
export class SystemLogTableComponent implements OnInit, OnChanges {
  @Input()
  minLogLevel: SystemLogLevel = SystemLogLevel.Info;

  logLevelOptions = [];
  showResolvedOptions: { label: string; value: boolean }[] = [];
  showResolvedLogs: boolean = false;
  maxSelectableDate: Date = new Date();

  @Input()
  rowsCount: number = 10;
  @Input()
  isSystemAlerts: boolean = false;

  @PageControls()
  controls = contributeControls([
    {
      key: 'SystemLog::ResolveSelectedLogs',
      action: () => this.resolveSelectedLogs(),
      disabled: () => this.loading,
      show: () => this.isSystemAlerts && this.selectedLogs.length > 0,
      loading: () => false,
      icon: 'fa fa-check-circle',
      severity: 'info',
    },
    {
      key: 'SystemLog::ResolveAllLogs',
      action: () => this.markAllAsReaded(),
      disabled: () => this.loading,
      show: () => this.isSystemAlerts,
      loading: () => false,
      icon: 'fa fa-check-circle',
      severity: 'info',
    }
  ]);
  readonly defaultSortField: string = 'lastModificationTime';
  readonly defaultSortOrder: string = 'desc';

  selectedLog: FullSystemLogDto | null = null;
  currentSorting: string = null;
  searchQueryText: string;
  searchQuery: string;
  items: ExtendedSystemLogDto[];
  filteredItems: ExtendedSystemLogDto[];
  selectedAlertLogIds: Set<string> = new Set<string>();
  selectedLogs: FullSystemLogDto[] = [];
  totalRecords: number;
  loading: boolean;
  jobRetrying: boolean;
  lastLazyLoadEvent?: LazyLoadEvent = null;
  viewportBreakpoints = viewportBreakpoints;
  SystemLogLevel = SystemLogLevel;
  dateRangeFilter: Date[] = null;

  showDetailsDialog: boolean = false;

  filtersCount: number = 0;

  constructor(
    public docMessageLogService: SystemLogService,
    public localizationService: ILocalizationService,
    public messageService: MessageService,
    public confirmationService: LocalizedConfirmationService
  ) {}

  get defaultSorting(): string {
    return `${this.defaultSortField} ${this.defaultSortOrder}`;
  }

  get isMobile() {
    return window.screen.width < 1089;
  }

  get isResizeFilters() {
    return window.screen.width < 700;
  }
  get hasSelectableAlertRows(): boolean {
    return this.isSystemAlerts && this.getSelectableAlertIds().length > 0;
  }

  get areAllVisibleAlertsSelected(): boolean {
    if (!this.hasSelectableAlertRows) {
      return false;
    }

    return this.getSelectableAlertIds().every((id) =>
      this.selectedAlertLogIds.has(id)
    );
  }

  get areSomeVisibleAlertsSelected(): boolean {
    if (!this.hasSelectableAlertRows) {
      return false;
    }

    return this.getSelectableAlertIds().some((id) =>
      this.selectedAlertLogIds.has(id)
    );
  }

  ngOnChanges(): void {
    if (!this.isSystemAlerts && this.selectedAlertLogIds.size > 0) {
      this.selectedAlertLogIds.clear();
    }
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  ngOnInit(): void {
    this.loading = true;
    this.jobRetrying = false;

    this.logLevelOptions = [
      {
        label: this.localizationService.instant('SystemLog::LogLevel:Info'),
        value: SystemLogLevel.Info,
      },
      {
        label: this.localizationService.instant('SystemLog::LogLevel:Warning'),
        value: SystemLogLevel.Warning,
      },
      // { label: this.localizationService.instant('SystemLog::LogLevel:Error'), value: SystemLogLevel.Error },
      {
        label: this.localizationService.instant('SystemLog::LogLevel:Critical'),
        value: SystemLogLevel.Critical,
      },
    ];

    this.showResolvedOptions = [
      {
        label: this.localizationService.instant('Infrastructure::Yes'),
        value: true,
      },
      {
        label: this.localizationService.instant('Infrastructure::No'),
        value: false,
      },
    ];
  }

  onLoadLogs(event: LazyLoadEvent) {
    this.loading = true;
    this.lastLazyLoadEvent = event;
    const sortField: string = event?.sortField || this.defaultSortField;
    const eventSortOrder = event?.sortOrder
      ? event?.sortOrder > 0
        ? 'asc'
        : 'desc'
      : null;
    const sortOrder: string =
      sortField === this.defaultSortField
        ? eventSortOrder ?? this.defaultSortOrder
        : eventSortOrder;
    const sorting: string = sortField + ' ' + sortOrder;
    this.currentSorting = sorting;
    if (this.searchQuery?.length > 0) {
      this.searchQuery = this.searchQuery.trim();
    }
    let fromDate = null,
      toDate = null;
    if (this.dateRangeFilter?.length > 0) {
      fromDate = this.dateRangeFilter[0]?.toLocaleString();
      toDate = this.dateRangeFilter[1]?.toLocaleString();
    }
    if (!fromDate && toDate) {
      fromDate = toDate;
    } else if (fromDate && !toDate) {
      toDate = fromDate;
    }

    this.filtersCount = this.dateRangeFilter?.length > 0 ? 1 : 0;
    this.filtersCount +=
      this.minLogLevel != null && this.minLogLevel !== SystemLogLevel.Info && !this.isSystemAlerts
        ? 1
        : 0;
    this.filtersCount += this.searchQuery?.length > 0 ? 1 : 0;
    this.filtersCount += this.isSystemAlerts && this.showResolvedLogs ? 1 : 0;

    this.docMessageLogService
      .getList({
        sorting: sorting,
        maxResultCount: this.rowsCount,
        skipCount: event?.first || 0,
        searchQuery: this.searchQuery,
        minLogLevelFilter: this.minLogLevel,
        creationFromDateFilter: fromDate,
        creationToDateFilter: toDate,
        onlyUnread: this.isSystemAlerts && !this.showResolvedLogs,
      })
      .pipe(
        first(),
        finalize(() => (this.loading = false))
      )
      .subscribe((paged) => {
        this.totalRecords = paged.totalCount;
        this.items = paged.items.map((item) => ({
          ...item,
          severity: this.getSeverity(item.logLevel),
          severityValue: this.getSeverityLabel(item.logLevel),
        }));
        this.filteredItems = this.items;
        this.syncSelectedAlertSelections();
      });
  }

  getSeverity(level: SystemLogLevel): string {
    switch (level) {
      case SystemLogLevel.Info:
        return 'info';
      case SystemLogLevel.Warning:
        return 'warning';
      // case SystemLogLevel.Error:
      //   return 'danger';
      case SystemLogLevel.Critical:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getSeverityLabel(level: SystemLogLevel): string {
    switch (level) {
      case SystemLogLevel.Info:
        return this.localizationService.instant('SystemLog::LogLevel:Info');
      case SystemLogLevel.Warning:
        return this.localizationService.instant('SystemLog::LogLevel:Warning');
      // case SystemLogLevel.Error:
      //   return this.localizationService.instant('SystemLog::LogLevel:Error');
      case SystemLogLevel.Critical:
        return this.localizationService.instant('SystemLog::LogLevel:Critical');
      default:
        return this.localizationService.instant('SystemLog::LogLevel:Unknown');
    }
  }

  reloadLogs(): void {
    if (this.lastLazyLoadEvent != null) {
      this.onLoadLogs(this.lastLazyLoadEvent);
    }
  }

  onSelect(row): void {
    if (!row) {
      return;
    }

    this.showDetailsDialog = true;
    this.selectedLog = row;

    const selectedId = this.selectedLog?.id;
    if (!selectedId) {
      return;
    }

    this.loading = true;
    this.docMessageLogService
      .getById(selectedId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((log) => {
        this.selectedLog = log;
      });
  }

  markReaded() {
    if (!this.selectedLog) {
      return;
    }

    this.docMessageLogService
      .markReaded({
        logIds: [this.selectedLog.id],
        isReaded: this.selectedLog.isArchived,
      })
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: this.localizationService.instant(
            this.selectedLog.isArchived
              ? 'SystemLog::LogMarkedAsReaded'
              : 'SystemLog::LogMarkedAsUnreaded'
          ),
        });
      });
  }

  markAllAsReaded() {
    this.confirmationService.confirm(
      this.localizationService.instant(
        'SystemLog::ResolveAllLogsConfirmationMessage'
      ),
      () => {
        this.docMessageLogService.markAllReaded().subscribe((res) => {
          this.messageService.add({
            severity: 'success',
            summary: this.localizationService.instant(
              'SystemLog::AllAlertsMarkedAsReaded'
            ),
          });
          this.onLoadLogs(this.lastLazyLoadEvent);
        });
      }
    );
  }

  onMessageTypeFilter({ value }) {
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  onClearMessageTypeFilter() {
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  clear(event) {
    this.searchQueryText = '';
    this.dateRangeFilter = null;
    this.minLogLevel = this.isSystemAlerts ? SystemLogLevel.Warning : SystemLogLevel.Info;
    this.showResolvedLogs = false;
    this.search(event);
  }

  search(event) {
    this.searchQuery = this.searchQueryText;
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  onSearchInput(event) {
    if (this.searchQueryText?.length <= 3) {
      if (this.searchQuery) {
        this.searchQuery = null;
        this.onLoadLogs(this.lastLazyLoadEvent);
      }

      return;
    }

    this.searchQuery = this.searchQueryText;
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  closeDetails(): void {
    this.selectedLog = null;
  }

  searchValidation(event: any) {
    let inputValue: string = event.target.value;

    inputValue = inputValue.replace(/^\s+/, '');

    if (!/\w/.test(inputValue)) {
      const cleanedValue = inputValue.replace(/^\s+/, '');
      event.target.value = cleanedValue;
      this.messageService.add({
        severity: 'warn',
        summary: this.localizationService.instant(
          'SystemLog::InvalidCharacters'
        ),
      });
    }

    if (inputValue === '') {
      this.messageService.add({
        severity: 'warn',
        summary: this.localizationService.instant(
          'SystemLog::InvalidCharacters'
        ),
      });
    }
  }
  onDetailsRetry(dto: SystemLogDto) {
    this.jobRetrying = false;
    this.onLoadLogs(this.lastLazyLoadEvent);
  }

  getEmptyMessage(): string {
    let msg = '';
    let counter = 0;
    if (this.searchQueryText?.length > 0) {
      counter++;
      msg = this.localizationService.instant('SystemLog::NoLogsBySearchText');
    }
    if (this.dateRangeFilter?.length > 0) {
      counter++;
      msg = this.localizationService.instant('SystemLog::NoLogsSelectedDates');
    }
    if (counter > 1) {
      msg = this.localizationService.instant(
        'SystemLog::NoRowsBySelectedParams'
      );
    } else if (counter <= 0) {
      msg = this.localizationService.instant('SystemLog::NoRows');
    }

    return msg;
  }

  onCommentButtonClick(event: Event): void {
    event.stopPropagation();
  }
  onDateRangeSelected(calendar: any) {
    if (
      this.dateRangeFilter &&
      this.dateRangeFilter.length === 2 &&
      this.dateRangeFilter[0] &&
      this.dateRangeFilter[1]
    ) {
      calendar.hideOverlay();
    }
  }

  onAlertSelectionChange(log: ExtendedSystemLogDto, isChecked: boolean): void {
    if (!this.isSystemAlerts || !log?.id) {
      return;
    }

    if (isChecked) {
      this.selectedAlertLogIds.add(log.id);
    } else {
      this.selectedAlertLogIds.delete(log.id);
    }
  }

  onAlertSelectAllChange(isChecked: boolean): void {
    if (!this.hasSelectableAlertRows) {
      return;
    }

    const selectableIds = this.getSelectableAlertIds();

    if (selectableIds.length === 0) {
      return;
    }

    if (isChecked) {
      selectableIds.forEach((id) => this.selectedAlertLogIds.add(id));
    } else {
      selectableIds.forEach((id) => this.selectedAlertLogIds.delete(id));
    }
  }

  resolveSelectedLogs(): void {
    this.confirmationService.confirm(
      this.localizationService.instant(
        'SystemLog::ResolveSelectedLogsConfirmationMessage'
      ),
      () => {
        if (!this.isSystemAlerts || this.selectedLogs.length === 0) {
          return;
        }

        const selectedIds = this.selectedLogs.map((log) => log.id);
        this.docMessageLogService
          .markReaded({ logIds: selectedIds, isReaded: true })
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: this.localizationService.instant(
                'SystemLog::AlertsResolved'
              ),
            });
            this.selectedAlertLogIds.clear();
            this.onLoadLogs(this.lastLazyLoadEvent);
          });
      },
    );
  }

  private syncSelectedAlertSelections(): void {
    if (!this.isSystemAlerts) {
      if (this.selectedAlertLogIds.size > 0) {
        this.selectedAlertLogIds.clear();
      }
      return;
    }

    if (!this.filteredItems?.length) {
      this.selectedAlertLogIds.clear();
      return;
    }

    const validIds = new Set(this.getSelectableAlertIds());

    const idsToRemove: string[] = [];
    this.selectedAlertLogIds.forEach((id) => {
      if (!validIds.has(id)) {
        idsToRemove.push(id);
      }
    });

    idsToRemove.forEach((id) => this.selectedAlertLogIds.delete(id));
  }

  private getSelectableAlertIds(): string[] {
    if (!Array.isArray(this.filteredItems)) {
      return [];
    }

    return this.filteredItems
      .filter((item) => !!item?.id)
      .map((item) => item.id);
  }

  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
