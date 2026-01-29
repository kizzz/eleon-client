import {
  ServiceDto,
  FullServiceDto,
  ServicesService
} from '@eleon/services-proxy';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { finalize } from 'rxjs'

import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { contributeControls, PAGE_CONTROLS, PageControls } from '@eleon/primeng-ui.lib'
@Component({
  standalone: false,
  selector: 'app-services-dashboard',
  templateUrl: './services-dashboard.component.html',
  styleUrls: ['./services-dashboard.component.scss']
})
export class ServicesDashboardComponent implements OnInit {
  totalRecords: number = 0;
  rows: ServiceDto[];
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  currentSorting: string;
  viewportBreakpoints = viewportBreakpoints;
	

  @PageControls() controls = contributeControls([
      PAGE_CONTROLS.RELOAD({
          key: 'ServicesModule::Refresh',
        show: () => true,
        loading: () => this.loading,
        action: () => this.reloadServices(),
        disabled: () => this.loading,
      })
    ]);

  constructor(
    public servicesService: ServicesService,
    public localizationService: ILocalizationService,
    public router: Router,
  ) { }

  ngOnInit(): void {

  }

  loadServices(event: LazyLoadEvent) {
    this.lastLoadEvent = event;
    this.loading = true;
    const sortField: string = event.sortField || 'lastStartupDateUtc';
    const eventSortOrder = event.sortOrder
      ? event.sortOrder > 0 ? 'asc' : 'desc'
      : null;
    const sortOrder: string = sortField === 'lastStartupDateUtc'
      ? eventSortOrder ?? 'desc'
      : eventSortOrder;
    const sorting: string = sortField + ' ' + sortOrder;
    this.currentSorting = sorting;

    this.servicesService.getList({
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

  reloadServices() {
    if (this.lastLoadEvent != null)
      this.loadServices(this.lastLoadEvent);
  }

  select(event) {
    const row = event.data;
    this.router.navigate(['/services/details', row.id]);
  }

  search(event) {
		// todo
    this.loadServices(this.lastLoadEvent);
  }

	getStatusName(status: any) {
    // switch (status) {
    //   case HealthCheckStatus.OK:
    //     return this.localizationService.instant('HealthCheckModule::Status:OK');
    //   case HealthCheckStatus.InProgress:
    //     return this.localizationService.instant('HealthCheckModule::Status:InProgress');
    //   case HealthCheckStatus.Failed:
    //     return this.localizationService.instant('HealthCheckModule::Status:Failed');
    //   default:
    //     return this.localizationService.instant('HealthCheckModule::Status:Unknown');
    // }

    return status;
  }

	getStatusClass(status: any) {
		// switch (status) {
		// 	case HealthCheckStatus.OK:
		// 		return 'success';
		// 	case HealthCheckStatus.InProgress:
		// 		return 'info';
		// 	case HealthCheckStatus.Failed:
		// 		return 'danger';
		// 	default:
		// 		return 'secondary';
		// }
    return 'success';
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
