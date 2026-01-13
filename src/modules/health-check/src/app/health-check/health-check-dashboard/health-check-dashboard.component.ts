import { HealthCheckDto, HealthCheckService, HealthCheckStatus } from '@eleon/health-check-proxy';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { finalize } from 'rxjs'

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: 'app-health-check-dashboard',
  templateUrl: './health-check-dashboard.component.html',
  styleUrls: ['./health-check-dashboard.component.scss']
})
export class HealthCheckDashboardComponent implements OnInit {
  totalRecords: number = 0;
rows: HealthCheckDto[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  currentSorting: string;
  viewportBreakpoints = viewportBreakpoints;
	

  constructor(
    public healthCheckService: HealthCheckService,
    public localizationService: ILocalizationService,
    public router: Router,
  ) { }

  ngOnInit(): void {

  }

  loadBackgroundJobs(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || 'creationTime';
    const eventSortOrder = event.sortOrder
      ? event.sortOrder > 0 ? 'asc' : 'desc'
      : null;
    const sortOrder: string = sortField === 'creationTime'
      ? eventSortOrder ?? 'desc'
      : eventSortOrder;
    const sorting: string = sortField + ' ' + sortOrder;
    this.currentSorting = sorting;

    this.healthCheckService.getList({
      maxResultCount: event?.rows || 10,
      skipCount: event.first,
      sorting,
    })
		.pipe(finalize(() => this.loading = false))
		.subscribe((rows) => {
      this.rows = rows.items;
      this.totalRecords = rows.totalCount;
    });
  }

  reloadBackgroundJobs() {
    if (this.lastLoadEvent != null)
      this.loadBackgroundJobs(this.lastLoadEvent);
  }

  select(event) {
    const row = event.data;
    this.router.navigate(['/health-checks/details', row.id]);
  }

  search(event) {
		// todo
    this.loadBackgroundJobs(this.lastLoadEvent);
  }

	getStatusName(status: HealthCheckStatus) {
    switch (status) {
      case HealthCheckStatus.OK:
        return this.localizationService.instant('HealthCheckModule::Status:OK');
      case HealthCheckStatus.InProgress:
        return this.localizationService.instant('HealthCheckModule::Status:InProgress');
      case HealthCheckStatus.Failed:
        return this.localizationService.instant('HealthCheckModule::Status:Failed');
      default:
        return this.localizationService.instant('HealthCheckModule::Status:Unknown');
    }
  }

	getStatusClass(status: HealthCheckStatus) {
		switch (status) {
			case HealthCheckStatus.OK:
				return 'success';
			case HealthCheckStatus.InProgress:
				return 'info';
			case HealthCheckStatus.Failed:
				return 'danger';
			default:
				return 'secondary';
		}
	}

  getTypeIcon(type: string) {
    switch (type) {
      case 'OnStart':
        return 'fas fa-up-long';
      case 'Scheduled':
        return 'fas fa-clock';
      default:
        return 'fas fa-book-medical';
    }
  }
}
