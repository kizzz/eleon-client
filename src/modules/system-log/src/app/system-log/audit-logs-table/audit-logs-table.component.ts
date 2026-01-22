import { LazyLoadEvent } from 'primeng/api';
import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { AuditLogService, SecurityLogService } from '@eleon/system-log-proxy';
import { AuditLogHeaderDto } from '@eleon/system-log-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';
import { AuditLogDetailsComponent } from '../audit-log-details/audit-log-details.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog'

interface MethodType {
  name: string;
  value: string | null;
}

interface ActionType {
  name: string;
  value: string | null;
}

interface HasException {
  name: string;
  value: boolean | null;
}

@Component({
  standalone: false,
  selector: 'app-audit-logs-table',
  templateUrl: './audit-logs-table.component.html',
  styleUrls: ['./audit-logs-table.component.scss'],
})
export class AuditLogsTableComponent implements OnInit {
  @Input()
  rowsCount = 20;

  @Input()
  minifiedFilters = false;

  @Input()
  userId: string;

  filtersCount = 0;

  auditLastLoadEvent: LazyLoadEvent | null;
  auditDateRangeFilter: Date[] = null;
  httpMethod: string;
  url: string;

  userName: string;
  applicationName: string;
  clientIpAddress: string;
  correlationId: string;
  maxExecutionDuration: number;
  minExecutionDuration: number;
  hasException: boolean = null;
  auditloading = false;
  selectedHttpStatusCode: HttpStatusCode;
  auditTotalRecords = 0;
  auditRows: AuditLogHeaderDto[] = [];
  types: MethodType[];
  hasExceptions: HasException[] = [];
  httpStatusCodes: { value: HttpStatusCode; name: string }[];
  isShowAuditCalendar = false;
  @ViewChild('auditCalendar') auditCalendar: DatePicker;
  @ViewChild('logDetails') auditLogDetails: AuditLogDetailsComponent;

  constructor(
    private auditLogService: AuditLogService,
    public localizationService: ILocalizationService,
    private securityLogService: SecurityLogService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    @Optional() private dynamicDialogConfig: DynamicDialogConfig,
  ) {
    this.userId = this.dynamicDialogConfig?.data?.userId || this.userId;
    this.rowsCount = this.dynamicDialogConfig?.data?.rowsCount || this.rowsCount;
    this.minifiedFilters = this.dynamicDialogConfig?.data?.minifiedFilters || this.minifiedFilters;
  }

  ngOnInit(): void {
    this.types = [
      { value: 'GET', name: 'GET' },
      { value: 'POST', name: 'POST' },
      { value: 'DELETE', name: 'DELETE' },
      { value: 'PUT', name: 'PUT' },
      { value: 'CONNECT', name: 'CONNECT' },
      { value: 'OPTIONS', name: 'OPTIONS' },
      { value: 'TRACE', name: 'TRACE' },
    ];

    this.hasExceptions = [
      {
        value: true,
        name: this.localizationService.instant('Infrastructure::Yes'),
      },
      {
        value: false,
        name: this.localizationService.instant('Infrastructure::No'),
      },
    ];

    this.mapHttpStatusCodeToDropdownItem();
  }

  onChange({ index }: { index: number }) {
    this.router.navigate([
      'auditlog/dashboard',
      {
        [0]: 'eventlogs',
        [1]: 'entitychanges',
        [2]: 'auditlogs',
        [3]: 'securitylogs',
      }[index],
    ]);
  }

  onRowSelect(event: any): void {
    if (event.data && this.auditLogDetails) {
      this.auditLogDetails.showDialog(event.data.id);
    }
  }

  getAuditLogs(event?: LazyLoadEvent) {
    this.auditLastLoadEvent = event;
    this.auditloading = true;
    const sortField: string = event.sortField || 'UserName';
    const sortOrder: string =
      sortField === 'UserName' ? 'desc' : event.sortOrder > 0 ? 'asc' : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;
    let fromDate = null,
      toDate = null;

    if (this.auditDateRangeFilter?.length > 0) {
      fromDate = this.auditDateRangeFilter[0];
      toDate = this.auditDateRangeFilter[1];
    }

    if (!fromDate && toDate) {
      fromDate = toDate;
    } else if (fromDate && !toDate) {
      toDate = fromDate;
    }

    this.filtersCount = this.auditDateRangeFilter?.length > 0 ? 1 : 0;
    this.filtersCount += this.httpMethod?.length > 0 ? 1 : 0;
    this.filtersCount += this.url?.length > 0 ? 1 : 0;
    this.filtersCount += this.applicationName?.length > 0 ? 1 : 0;
    this.filtersCount += this.clientIpAddress?.length > 0 ? 1 : 0;
    this.filtersCount += this.correlationId?.length > 0 ? 1 : 0;
    this.filtersCount += this.maxExecutionDuration > 0 ? 1 : 0;
    this.filtersCount += this.minExecutionDuration > 0 ? 1 : 0;
    this.filtersCount += this.hasException != null ? 1 : 0;
    this.filtersCount += this.selectedHttpStatusCode != null ? 1 : 0;

    if (!this.userId) {
      this.filtersCount += this.userName?.length > 0 ? 1 : 0;
    }

    this.auditLogService
      .getAuditLogListByInput({
        applicationName: this.applicationName,
        maxResultCount: this.rowsCount,
        skipCount: event?.first,
        clientIpAddress: this.clientIpAddress,
        correlationId: this.correlationId,
        endTime: toDate,
        hasException: this.hasException,
        httpMethod: this.httpMethod,
        httpStatusCode: this.selectedHttpStatusCode,
        maxExecutionDuration: this.maxExecutionDuration,
        minExecutionDuration: this.minExecutionDuration,
        sorting: sorting,
        startTime: fromDate,
        url: this.url,
        userId: this.userId,
        userName: this.userName,
      })
      .subscribe((result) => {
        this.auditRows = result.items;
        this.auditTotalRecords = result.totalCount;
        this.auditloading = false;
      });
  }

  getEmptyAuditLogsMessage(): string {
    let msg = '';
    let counter = 0;
    if (this.auditDateRangeFilter?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsBySelectedDates'
      );
    }
    if (this.userName?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredUserName'
      );
    }
    if (this.url?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredURL'
      );
    }
    if (this.minExecutionDuration > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredMinExecutionDuration'
      );
    }
    if (this.maxExecutionDuration > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredMaxExecutionDuration'
      );
    }
    if (this.httpMethod?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsBySelectedHttpMethod'
      );
    }
    if (this.selectedHttpStatusCode != null) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsBySelectedHttpStatusCode'
      );
    }
    if (this.applicationName?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredApplicationName'
      );
    }

    if (this.clientIpAddress?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredClientIpAddress'
      );
    }

    if (this.correlationId?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsByEnteredCorrelationId'
      );
    }

    if (this.hasException != null) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsBySelectedHasExceptionOptions'
      );
    }

    if (counter > 1) {
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoAuditLogsBySelectedParams'
      );
    }

    return msg;
  }

  getApplicationNameLocal(value: string) {
    return this.localizationService.instant(
      'Infrastructure::AuditLog:' + value
    );
  }

  clearAuditFilter() {
    this.auditDateRangeFilter = null;
    this.httpMethod = null;
    this.url = null;
    this.userId = null;
    this.userName = null;
    this.applicationName = null;
    this.clientIpAddress = null;
    this.correlationId = null;
    this.maxExecutionDuration = null;
    this.minExecutionDuration = null;
    this.hasException = null;
    this.auditloading = false;
    this.selectedHttpStatusCode = null;
    this.auditTotalRecords = 0;
    this.auditRows = [];
    this.getAuditLogs(this.auditLastLoadEvent);
  }

  searchAuditLog() {
    this.getAuditLogs(this.auditLastLoadEvent);
  }

  getSeverity(code: number) {
    if (code === null) {
      return 'primary';
    }
    else if (code >= 100 && code <= 199) {
      return 'primary';
    } else if (code >= 200 && code <= 299) {
      return 'success';
    } else if (code >= 300 && code <= 399) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  getSeverityForMethod(method: string) {
    if (!method)
    {
      return 'primary';
    }
    else if (method === 'GET') {
      return 'primary';
    } else {
      return 'warning';
    }
  }

  mapHttpStatusCodeToDropdownItem(): void {
    this.httpStatusCodes = [
      {
        value: HttpStatusCode.Continue,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Continue'
        ),
      },
      {
        value: HttpStatusCode.SwitchingProtocols,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:SwitchingProtocols'
        ),
      },
      {
        value: HttpStatusCode.Processing,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Processing'
        ),
      },
      {
        value: HttpStatusCode.EarlyHints,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:EarlyHints'
        ),
      },
      {
        value: HttpStatusCode.Ok,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:OK'
        ),
      },
      {
        value: HttpStatusCode.Created,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Created'
        ),
      },
      {
        value: HttpStatusCode.Accepted,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Accepted'
        ),
      },
      {
        value: HttpStatusCode.NonAuthoritativeInformation,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NonAuthoritativeInformation'
        ),
      },
      {
        value: HttpStatusCode.NoContent,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NoContent'
        ),
      },
      {
        value: HttpStatusCode.ResetContent,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ResetContent'
        ),
      },
      {
        value: HttpStatusCode.PartialContent,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PartialContent'
        ),
      },
      {
        value: HttpStatusCode.MultiStatus,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:MultiStatus'
        ),
      },
      {
        value: HttpStatusCode.AlreadyReported,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:AlreadyReported'
        ),
      },
      {
        value: HttpStatusCode.ImUsed,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ImUsed'
        ),
      },
      {
        value: HttpStatusCode.MultipleChoices,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:MultipleChoices'
        ),
      },
      {
        value: HttpStatusCode.MovedPermanently,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:MovedPermanently'
        ),
      },
      {
        value: HttpStatusCode.Found,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Found'
        ),
      },
      {
        value: HttpStatusCode.SeeOther,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:SeeOther'
        ),
      },
      {
        value: HttpStatusCode.NotModified,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NotModified'
        ),
      },
      {
        value: HttpStatusCode.UseProxy,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UseProxy'
        ),
      },
      {
        value: HttpStatusCode.Unused,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Unused'
        ),
      },
      {
        value: HttpStatusCode.TemporaryRedirect,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:TemporaryRedirect'
        ),
      },
      {
        value: HttpStatusCode.PermanentRedirect,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PermanentRedirect'
        ),
      },
      {
        value: HttpStatusCode.BadRequest,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:BadRequest'
        ),
      },
      {
        value: HttpStatusCode.Unauthorized,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Unauthorized'
        ),
      },
      {
        value: HttpStatusCode.PaymentRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PaymentRequired'
        ),
      },
      {
        value: HttpStatusCode.Forbidden,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Forbidden'
        ),
      },
      {
        value: HttpStatusCode.NotFound,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NotFound'
        ),
      },
      {
        value: HttpStatusCode.MethodNotAllowed,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:MethodNotAllowed'
        ),
      },
      {
        value: HttpStatusCode.NotAcceptable,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NotAcceptable'
        ),
      },
      {
        value: HttpStatusCode.ProxyAuthenticationRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ProxyAuthenticationRequired'
        ),
      },
      {
        value: HttpStatusCode.RequestTimeout,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:RequestTimeout'
        ),
      },
      {
        value: HttpStatusCode.Conflict,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Conflict'
        ),
      },
      {
        value: HttpStatusCode.Gone,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Gone'
        ),
      },
      {
        value: HttpStatusCode.LengthRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:LengthRequired'
        ),
      },
      {
        value: HttpStatusCode.PreconditionFailed,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PreconditionFailed'
        ),
      },
      {
        value: HttpStatusCode.PayloadTooLarge,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PayloadTooLarge'
        ),
      },
      {
        value: HttpStatusCode.UriTooLong,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UriTooLong'
        ),
      },
      {
        value: HttpStatusCode.UnsupportedMediaType,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UnsupportedMediaType'
        ),
      },
      {
        value: HttpStatusCode.RangeNotSatisfiable,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:RangeNotSatisfiable'
        ),
      },
      {
        value: HttpStatusCode.ExpectationFailed,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ExpectationFailed'
        ),
      },
      {
        value: HttpStatusCode.ImATeapot,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ImATeapot'
        ),
      },
      {
        value: HttpStatusCode.MisdirectedRequest,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:MisdirectedRequest'
        ),
      },
      {
        value: HttpStatusCode.UnprocessableEntity,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UnprocessableEntity'
        ),
      },
      {
        value: HttpStatusCode.Locked,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:Locked'
        ),
      },
      {
        value: HttpStatusCode.FailedDependency,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:FailedDependency'
        ),
      },
      {
        value: HttpStatusCode.TooEarly,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:TooEarly'
        ),
      },
      {
        value: HttpStatusCode.UpgradeRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UpgradeRequired'
        ),
      },
      {
        value: HttpStatusCode.PreconditionRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:PreconditionRequired'
        ),
      },
      {
        value: HttpStatusCode.TooManyRequests,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:TooManyRequests'
        ),
      },
      {
        value: HttpStatusCode.RequestHeaderFieldsTooLarge,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:RequestHeaderFieldsTooLarge'
        ),
      },
      {
        value: HttpStatusCode.UnavailableForLegalReasons,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:UnavailableForLegalReasons'
        ),
      },
      {
        value: HttpStatusCode.InternalServerError,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:InternalServerError'
        ),
      },
      {
        value: HttpStatusCode.NotImplemented,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NotImplemented'
        ),
      },
      {
        value: HttpStatusCode.BadGateway,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:BadGateway'
        ),
      },
      {
        value: HttpStatusCode.ServiceUnavailable,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:ServiceUnavailable'
        ),
      },
      {
        value: HttpStatusCode.GatewayTimeout,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:GatewayTimeout'
        ),
      },
      {
        value: HttpStatusCode.HttpVersionNotSupported,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:HttpVersionNotSupported'
        ),
      },
      {
        value: HttpStatusCode.VariantAlsoNegotiates,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:VariantAlsoNegotiates'
        ),
      },
      {
        value: HttpStatusCode.InsufficientStorage,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:InsufficientStorage'
        ),
      },
      {
        value: HttpStatusCode.LoopDetected,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:LoopDetected'
        ),
      },
      {
        value: HttpStatusCode.NotExtended,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NotExtended'
        ),
      },
      {
        value: HttpStatusCode.NetworkAuthenticationRequired,
        name: this.localizationService.instant(
          'Infrastructure::HttpStatusCode:NetworkAuthenticationRequired'
        ),
      },
    ];
  }

  getRowActionLocalization(action: string): string {
    if (!action) return '';
    if (action) {
      return this.localizationService.instant(`Infrastructure::${action}`);
    }
    return '';
  }

  showAuditCalendar(event) {
    this.isShowAuditCalendar = !this.isShowAuditCalendar;
    if (this.isShowAuditCalendar) {
      this.auditCalendar.showOverlay();
      this.auditCalendar.cd.detectChanges();
      event.stopPropagation();
    } else {
      this.auditCalendar.hideOverlay();
      this.auditCalendar.cd.detectChanges();
    }
  }

  onDateRangeSelected(calendar: any) {
    if (
      this.auditDateRangeFilter &&
      this.auditDateRangeFilter.length === 2 &&
      this.auditDateRangeFilter[0] &&
      this.auditDateRangeFilter[1]
    ) {
      calendar.hideOverlay();
    }
  }
  
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
