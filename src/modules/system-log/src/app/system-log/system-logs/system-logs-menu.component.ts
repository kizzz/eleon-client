import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FullSystemLogDto,
  SystemLogDto,
  SystemLogLevel,
  SystemLogService,
  UnresolvedSystemLogCountDto,
} from '@eleon/system-log-proxy';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import {
  Subject,
  asyncScheduler,
  exhaustMap,
  finalize,
  map,
  takeUntil,
  throttleTime,
} from 'rxjs';

import { SystemLogModule } from '../system-log.module'
import { SystemLogHubService } from '../services/system-log-hub.service';
interface LogsLoadRequest {
  skip: number;
  take: number;
  reset: boolean;
}

@Component({
  selector: 'app-system-logs-overlay',
  templateUrl: './system-logs-menu.component.html',
  styleUrl: './system-logs-menu.component.scss',
  standalone: true,
  imports: [
    SharedModule,
    SystemLogModule,
    PopoverModule,
    TooltipModule,
    BadgeModule,
    TableModule,
    ResponsiveTableModule,
  ],
})
export class SystemLogsOverlayComponent implements OnInit {
  opened = false;
  logs: SystemLogDto[] = [];
  loading = false;
  pageSize = 10;
  private destroy$ = new Subject<void>();
  private loadSystemLogsSubject = new Subject<LogsLoadRequest>();
  private unresolvedSystemLogsCountSubject = new Subject<void>();
  private allLogsLoaded = false;
  unresolvedSystemLogs: UnresolvedSystemLogCountDto = {
    criticalUnresolvedCount: 0,
    warningUnresolvedCount: 0,
  };
  selectedLog: FullSystemLogDto | null = null;
  showDetailsDialog = false;

  SystemLogLevel = SystemLogLevel;

  get count(): number {
    return (
      this.unresolvedSystemLogs.criticalUnresolvedCount +
      this.unresolvedSystemLogs.warningUnresolvedCount
    );
  }
  get warningIcon(): string {
    if (this.unresolvedSystemLogs.criticalUnresolvedCount == 0 && this.unresolvedSystemLogs.warningUnresolvedCount == 0) {
      return 'fa-triangle-exclamation';
    }
    if (this.unresolvedSystemLogs.criticalUnresolvedCount >= this.unresolvedSystemLogs.warningUnresolvedCount) return 'fa-circle-exclamation red-warning'; 
    else return 'fa-triangle-exclamation orange-warning';
  }
  get isMobile(): boolean {
    return window.screen.width < 1089;
  }

  constructor(
    private router: Router,
    private systemLogHub: SystemLogHubService,
    private systemLogService: SystemLogService,
  ) {}

  ngOnInit(): void {
    this.systemLogHub.systemLog$.subscribe((newLog) => {
      if (this.opened) {
        this.unresolvedSystemLogs = {
          criticalUnresolvedCount: 0,
          warningUnresolvedCount: 0,
        };
        this.reloadFromStart();
      } else {
        this.unresolvedSystemLogsCountSubject.next();
      }
    });
    this.unresolvedSystemLogsCountSubject
      .pipe(
        exhaustMap(() => this.systemLogService.getTotalUnresolvedCount()),
        takeUntil(this.destroy$)
      )
      .subscribe((count) => {
        this.unresolvedSystemLogs = count;
      });
    this.loadSystemLogsSubject
      .pipe(
        throttleTime(1000, asyncScheduler, { leading: true, trailing: true }),
        exhaustMap((request) => {
          this.loading = true;
          return this.loadSystemLogs$(request).pipe(
            finalize(() => (this.loading = false))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ items, totalCount, reset }) => {
        this.logs = reset ? items : [...this.logs, ...items];
        this.allLogsLoaded = this.logs.length >= totalCount;
      });

      this.unresolvedSystemLogsCountSubject.next();
  }

  onOverlayShow() {
    this.opened = true;
    this.reloadFromStart();
  }

  onOverlayHide() {
    this.opened = false;
    // this.onDetailsDialogHide();
  }

  onLogsScroll(event: Event) {
    if (this.loading || this.allLogsLoaded) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const threshold = 24;
    const reachedBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

    if (reachedBottom) {
      this.loadNextPage();
    }
  }

  onLogRowClick(log: SystemLogDto) {
    if (!log?.id) {
      return;
    }

    this.showDetailsDialog = true;
    this.selectedLog = log as FullSystemLogDto;
    this.loading = true;
    this.systemLogService
      .getById(log.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((fullLog) => {
        this.selectedLog = fullLog;
      });
  }

  onDetailsDialogHide() {
    this.showDetailsDialog = false;
    this.selectedLog = null;
  }

  onReadStatusChange() {
    if (!this.selectedLog?.id) {
      return;
    }

    this.systemLogService
      .markReaded({
        logIds: [this.selectedLog.id],
        isReaded: this.selectedLog.isArchived,
      })
      .subscribe(() => {
        this.unresolvedSystemLogsCountSubject.next();
        this.reloadFromStart();
      });
  }

  private reloadFromStart() {
    this.allLogsLoaded = false;
    this.loadSystemLogsSubject.next({
      skip: 0,
      take: this.pageSize,
      reset: true,
    });
  }

  private loadNextPage() {
    if (this.loading || this.allLogsLoaded) {
      return;
    }

    this.loadSystemLogsSubject.next({
      skip: this.logs.length,
      take: this.pageSize,
      reset: false,
    });
  }

  private loadSystemLogs$(request: LogsLoadRequest) {
    return this.systemLogService
      .getList({
        maxResultCount: request.take,
        skipCount: request.skip,
        minLogLevelFilter: SystemLogLevel.Warning,
        sorting: 'LastModificationTime desc',
        onlyUnread: true,
      })
      .pipe(
        map((res) => ({
          items: res.items,
          totalCount: res.totalCount,
          reset: request.reset,
        }))
      );
  }

  markAsRead(log: SystemLogDto) {
    this.systemLogService
      .markReaded({
        logIds: [log.id],
        isReaded: true,
      })
      .subscribe(() => {
        this.reloadFromStart();
      });
  }

  viewAllClicked() {
    this.router.navigate(['system-logs/dashboard/systemalerts']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
