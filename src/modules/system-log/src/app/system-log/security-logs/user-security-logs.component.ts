import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SecurityLogDto, SecurityLogService } from '@eleon/system-log-proxy';
import moment from 'moment';
import { LazyLoadEvent } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'

interface ActionType {
  name: string;
value: string | null;
}

@Component({
  standalone: false,
  selector: 'app-user-security-logs',
  templateUrl: './user-security-logs.component.html',
  styleUrl: './user-security-logs.component.scss',
})
export class UserSecurityLogsComponent implements OnInit, OnChanges {
  @Input()
  rowsCount: number = 20;
  securityLastLoadEvent: LazyLoadEvent | null;

  securityloading = false;
  securityTotalRecords: number = 0;
  securityRows: SecurityLogDto[] = [];
  action: string;
  actionTypes: ActionType[];
  isShowCalendar: boolean = false;
  @ViewChild('calendar') calendar: DatePicker;

  // filters
  @Input()
  minifiedFilters: boolean = false;

  filtersCount: number = 0;

  securityDateRangeFilter: Date[] = null;
  securityApplicationName: string;
  securityUserName: string;
  identity: string;
  clientId: string;
  securityCorrelationId: string;
  clientIpAddress: string;
  selectedLog: SecurityLogDto;
  displayLogDialog = false;

  @Input()
  userId: string;

  constructor(
    private localizationService: ILocalizationService,
    private securityLogService: SecurityLogService,
    @Optional() private config: DynamicDialogConfig
  ) {
    this.userId = this.config?.data?.userId || this.userId;
    this.rowsCount = this.config?.data?.rowsCount || this.rowsCount;
    this.minifiedFilters = this.config?.data?.minifiedFilters || this.minifiedFilters;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this.getSecurityChanges(this.securityLastLoadEvent);
    }
  }

  public ngOnInit(): void {
    this.actionTypes = [
      {
        value: 'LoginSucceeded',
        name: this.localizationService.instant(
          'Infrastructure::LoginSucceeded'
        ),
      },
      {
        value: 'LoginFailed',
        name: this.localizationService.instant('Infrastructure::LoginFailed'),
      },
      {
        value: 'Logout',
        name: this.localizationService.instant('Infrastructure::Logout'),
      },
      {
        value: 'LoginRequiresTwoFactor',
        name: this.localizationService.instant(
          'Infrastructure::LoginRequiresTwoFactor'
        ),
      },
      {
        value: 'LoginWithExternalProvider',
        name: this.localizationService.instant(
          'Infrastructure::LoginWithExternalProvider'
        ),
      },
      {
        value: 'StartRemoteLogout',
        name: this.localizationService.instant(
          'Infrastructure::StartRemoteLogout'
        ),
      },
    ];
  }

  clearSecurityFilter() {
    this.securityUserName = null;
    this.identity = null;
    this.clientId = null;
    this.clientIpAddress = null;
    this.securityCorrelationId = null;
    this.securityDateRangeFilter = null;
    this.securityloading = false;
    this.action = null;
    this.securityApplicationName = null;
    this.securityTotalRecords = 0;
    this.securityRows = [];
    this.getSecurityChanges(this.securityLastLoadEvent);
  }

  searchSecurityChanges() {
    this.getSecurityChanges(this.securityLastLoadEvent);
  }

  public getSecurityChanges(event?: LazyLoadEvent) {
    this.securityLastLoadEvent = event;
    this.securityloading = true;
    const sortField: string = event?.sortField || 'CreationTime';
    const sortOrder: string =
      sortField === 'CreationTime'
        ? 'desc'
        : event?.sortOrder > 0
        ? 'asc'
        : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;
    let fromDate = null,
      toDate = null;

    if (this.securityDateRangeFilter?.length > 0) {
      fromDate = this.securityDateRangeFilter[0]
        ? moment(this.securityDateRangeFilter[0]).format('YYYY-MM-DDTHH:mm:ss')
        : null;
      toDate = this.securityDateRangeFilter[1]
        ? moment(this.securityDateRangeFilter[1]).format('YYYY-MM-DDTHH:mm:ss')
        : null;
    }
    if (!fromDate && toDate) {
      fromDate = toDate;
    } else if (fromDate && !toDate) {
      toDate = fromDate;
    }

    this.filtersCount = this.securityDateRangeFilter?.length > 0 ? 1 : 0;
    this.filtersCount += this.action?.length > 0 ? 1 : 0;
    this.filtersCount += this.securityApplicationName?.length > 0 ? 1 : 0;
    this.filtersCount += this.securityUserName?.length > 0 ? 1 : 0;
    this.filtersCount += this.identity?.length > 0 ? 1 : 0;
    this.filtersCount += this.clientId?.length > 0 ? 1 : 0;
    this.filtersCount += this.securityCorrelationId?.length > 0 ? 1 : 0;
    this.filtersCount += this.clientIpAddress?.length > 0 ? 1 : 0;
    if (!this.userId && this.securityUserName?.length > 0) {
      this.filtersCount += 1;
    }

    this.securityLogService
      .getSecurityLogListByInput({
        maxResultCount: this.rowsCount,
        skipCount: event?.first,
        startTime: fromDate,
        endTime: toDate,
        sorting: sorting,
        action: this.action,
        clientId: this.clientId,
        applicationName: this.securityApplicationName,
        correlationId: this.securityCorrelationId,
        identity: this.identity,
        userName: this.securityUserName,
        userId: this.userId,
        clientIpAddress: this.clientIpAddress,
      })
      .subscribe((result) => {
        this.securityRows = result.items;
        this.securityTotalRecords = result.totalCount;
        this.securityloading = false;
      });
  }

  getSecurityApplicationNameLocal(value: string) {
    return this.localizationService.instant(
      'Infrastructure::SecurityLog:' + value
    );
  }

  getRowActionLocalization(action: string): string {
    if (!action) return null;
    if (action) {
      return this.localizationService.instant(`Infrastructure::${action}`);
    }
    return '';
  }

  getEmptySecurityChangesMessage(): string {
    let msg = '';
    let counter = 0;
    if (this.securityDateRangeFilter?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoSecurityChangesBySelectedDates'
      );
    }
    if (this.action?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoSecurityChangesBySelectedAction'
      );
    }
    if (this.securityApplicationName?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoSecurityChangesByEnteredApplicationName'
      );
    }
    if (counter > 1) {
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoSecurityChangesBySelectedParams'
      );
    }
    if (counter == 0) {
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoSecurityChangesBySelectedDates'
      );
    }

    return msg;
  }

  showCalendar(event) {
    this.isShowCalendar = !this.isShowCalendar;
    if (this.isShowCalendar) {
      this.calendar.showOverlay();
      this.calendar.cd.detectChanges();
      event.stopPropagation();
    } else {
      this.calendar.hideOverlay();
      this.calendar.cd.detectChanges();
    }
  }

  openLogDetails(row: SecurityLogDto): void {
    this.selectedLog = row;
    this.securityLogService
      .getSecurityLogById(row.id)
      .subscribe((log) => {
        this.selectedLog = log;
        this.displayLogDialog = true;
      });
  }

  onDateRangeSelected(calendar: any) {
    if (
      this.securityDateRangeFilter &&
      this.securityDateRangeFilter.length === 2 &&
      this.securityDateRangeFilter[0] &&
      this.securityDateRangeFilter[1]
    ) {
      calendar.hideOverlay();
    }
  }
  get isMobile() {
    return window.screen.width < 1089;
  }
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
