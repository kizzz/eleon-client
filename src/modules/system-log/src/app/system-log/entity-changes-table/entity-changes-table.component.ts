import { LazyLoadEvent } from 'primeng/api';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AuditLogService } from '@eleon/system-log-proxy';
import { EntityChangeDto } from '@eleon/system-log-proxy';
import { EntityChangeType } from '@eleon/system-log-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-entity-changes-table',
  templateUrl: './entity-changes-table.component.html',
  styleUrls: ['./entity-changes-table.component.scss'],
})
export class EntityChangesTableComponent implements OnInit {
  @Input()
  rowsCount = 20;

  @Input()
  minifiedFilters = false;

  filtersCount = 0;

  //#region  Entity Changes filter
  entityLastLoadEvent: LazyLoadEvent | null;
  entityDateRangeFilter: Date[] = null;
  entityloading = false;
  entityId: string;
  entityTypeFullName: string;
  auditLogId: string;
  selectedEntityChangeType: EntityChangeType = null;
  entityTotalRecords = 0;
  entityChangeRows: EntityChangeDto[] = [];
  localizedEntityChangeTypes: { value: EntityChangeType; name: string }[];
  isShowEntityCalendar = false;
  @ViewChild('entityCalendar') entityCalendar: DatePicker;
  //#endregion

  constructor(
    private auditLogService: AuditLogService,
    public localizationService: ILocalizationService,
    public activatedRoute: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.localizedEntityChangeTypes = [
      EntityChangeType.Created,
      EntityChangeType.Updated,
      EntityChangeType.Deleted,
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::ChangeType:${EntityChangeType[value]}`
      ),
    }));
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

  getApplicationNameLocal(value: string) {
    return this.localizationService.instant(
      'Infrastructure::AuditLog:' + value
    );
  }

  getEntityChanges(event?: LazyLoadEvent) {
    this.entityLastLoadEvent = event;
    this.entityloading = true;
    const sortField: string = event?.sortField || 'ChangeTime';
    const sortOrder: string =
      sortField === 'ChangeTime'
        ? 'desc'
        : event?.sortOrder > 0
        ? 'asc'
        : 'desc';
    const sorting: string = sortField + ' ' + sortOrder;

    let fromDate = null,
      toDate = null;
    if (this.entityDateRangeFilter?.length > 0) {
      fromDate = this.entityDateRangeFilter[0];
      toDate = this.entityDateRangeFilter[1];
    }

    if (!fromDate && toDate) {
      fromDate = toDate;
    } else if (fromDate && !toDate) {
      toDate = fromDate;
    }

    this.filtersCount = 0;
    if (this.entityId?.length > 0) this.filtersCount++;
    if (this.entityTypeFullName?.length > 0) this.filtersCount++;
    if (this.auditLogId?.length > 0) this.filtersCount++;
    if (this.selectedEntityChangeType) this.filtersCount++;
    if (this.entityDateRangeFilter?.length > 0) this.filtersCount++;

    this.auditLogService
      .getEntityChangeListByInput({
        maxResultCount: this.rowsCount,
        skipCount: event?.first,
        auditLogId: this.auditLogId,
        endTime: toDate,
        entityChangeType: this.selectedEntityChangeType,
        entityId: this.entityId,
        entityTypeFullName: this.entityTypeFullName?.replace(/\s+/g, ''),
        sorting: sorting,
        startTime: fromDate,
      })
      .subscribe((result) => {
        this.entityChangeRows = result.items;
        this.entityTotalRecords = result.totalCount;
        this.entityloading = false;
      });
  }

  getEntityTypeNameLocal(value: string) {
    return this.localizationService.instant('Infrastructure::' + value);
  }

  getEntityChangeTypeName(changeType: number): string {
    const check = this.localizedEntityChangeTypes.find(
      (x) => x.value === changeType
    );
    if (check) {
      return this.localizationService.instant(
        `Infrastructure::ChangeType:${check.name}`
      );
    }
    return '';
  }

  getSeverityForEntityChangeType(changeType: EntityChangeType): string {
    switch (changeType) {
      case EntityChangeType.Created:
        return 'info';
      case EntityChangeType.Deleted:
        return 'danger';
      case EntityChangeType.Updated:
        return 'warn';
      default:
        return 'secondary';
    }
  }

  showEntityChangesDetails = false;
  selectedEntityChange: EntityChangeDto;
  onEntityChangesSelect(event) {
    this.selectedEntityChange = event.data;
    this.showEntityChangesDetails = true;

    this.auditLogService
      .getEntityChangeByIdById(this.selectedEntityChange.id)
      .subscribe((result) => {
        this.selectedEntityChange = result;
      });
  }

  searchEntityChanges() {
    this.getEntityChanges(this.entityLastLoadEvent);
  }

  clearEntityFilter() {
    this.entityDateRangeFilter = null;
    this.entityloading = false;
    this.entityId = null;
    this.entityTypeFullName = null;
    this.auditLogId = null;
    this.selectedEntityChangeType = null;
    this.entityTotalRecords = 0;
    this.entityChangeRows = [];
    this.getEntityChanges(this.entityLastLoadEvent);
  }

  getEmptyEntityChangesName(): string {
    let msg = '';
    let counter = 0;
    if (this.selectedEntityChangeType) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoEntityChangesBySelectedChangeType'
      );
    }
    if (this.entityDateRangeFilter?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoEntityChangesBySelectedDates'
      );
    }
    if (this.entityTypeFullName?.length > 0) {
      counter++;
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoEntityChangesByEnteredObjectType'
      );
    }
    if (counter > 1) {
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoEntityChangesBySelectedParams'
      );
    }
    if (counter === 0) {
      msg = this.localizationService.instant(
        'Infrastructure::AuditLog:NoEntityChanges'
      );
    }

    return msg;
  }

  getSeverity(code: number) {
    if (code >= 100 && code <= 199) {
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
    if (method === 'GET') {
      return 'primary';
    } else {
      return 'warning';
    }
  }

  getRowActionLocalization(action: string): string {
    if (!action) return '';
    if (action) {
      return this.localizationService.instant(`Infrastructure::${action}`);
    }
    return '';
  }

  showEntityCalendar(event) {
    this.isShowEntityCalendar = !this.isShowEntityCalendar;
    if (this.isShowEntityCalendar) {
      this.entityCalendar.showOverlay();
      this.entityCalendar.cd.detectChanges();
      event.stopPropagation();
    } else {
      this.entityCalendar.hideOverlay();
      this.entityCalendar.cd.detectChanges();
    }
  }

  onDateRangeSelected(calendar: any) {
    if (
      this.entityDateRangeFilter &&
      this.entityDateRangeFilter.length === 2 &&
      this.entityDateRangeFilter[0] &&
      this.entityDateRangeFilter[1]
    ) {
      calendar.hideOverlay();
    }
  }
  async copyId(id: string, event: MouseEvent) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
  }
}
