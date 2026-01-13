import {
  FullHealthCheckDto,
  HealthCheckReportDto,
  HealthCheckService,
  HealthCheckStatus,
  ReportExtraInformationDto,
} from '@eleon/health-check-proxy';
import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { handleError, viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize, first } from 'rxjs/operators';
import { DocumentTemplateType } from '@eleon/primeng-ui.lib';
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib'
import { ILocalizationService } from '@eleon/angular-sdk.lib';

interface BackgroundJobDetails {
  data: FullHealthCheckDto;
}

@Component({
  standalone: false,
  selector: 'app-health-check-details',
  templateUrl: './health-check-details.component.html',
  styleUrls: ['./health-check-details.component.scss']
})

export class HealthCheckDetailsComponent implements OnInit {
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  viewportBreakpoints = viewportBreakpoints;
  details: BackgroundJobDetails;
  totalRecords: number;
  rows: number = 10;
  lastLazyLoadEvent?: LazyLoadEvent = null;
  selectedReport: HealthCheckReportDto;
  activeTab: string = 'details';
	templateType: DocumentTemplateType = DocumentTemplateType.Json;

	@PageControls() controls = contributeControls([
		// {
		// 	key: 'BackgroundJob::BackgroundJobs:Cancel',
		// 	icon: 'fa fa-times',
		// 	severity: 'danger',
		// 	show: () => !!this.details?.data && (this.details.data.status == BackgroundJobStatus.Executing || this.details.data.status == BackgroundJobStatus.Retring),
		// 	loading: () => this.loading,
		// 	disabled: () => this.loading,
		// 	action: () => this.cancelJob(),
		// },
	]);

  constructor(
    public localizationService: ILocalizationService,
    public router: Router,
    public route: ActivatedRoute,
    public messageService: LocalizedMessageService,
		private healthCheckService: HealthCheckService,
  ) { }

  ngOnInit(): void {
    this.loadBackgroundJob();
  }

	

  loadBackgroundJob(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.loading = true;
        this.healthCheckService
          .getById(params['id'])
					.pipe(finalize(() => this.loading = false),
							handleError(err => this.messageService.error(err.message)))
          .subscribe(data => {
							this.details = {
                data: data,
              };
            });
      }
    });
  }

  select(row: HealthCheckReportDto){
    this.selectedReport = row;
    this.activeTab = 'details';
  }

  colorOfRow(row: HealthCheckReportDto){
    var tmp = this.selectedReport != null && row != null && this.selectedReport?.id == row?.id;
    return tmp;
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

  showMessageDetailsDialog = false;
	selectedMessage: ReportExtraInformationDto = null;

	openMessageDetails(message: ReportExtraInformationDto){
		this.selectedMessage = message;
		this.showMessageDetailsDialog = true;
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
