import {
  ServiceDto,
  FullServiceDto,
  ServicesService,
  ServiceModuleDto,
  ManifestHistoryDto,
  ManifestHistoriesService
} from '@eleon/services-proxy';
import { Component, OnInit } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { handleError, viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalizedMessageService, PAGE_CONTROLS } from '@eleon/primeng-ui.lib';
import { finalize, first } from 'rxjs/operators';
import { DocumentTemplateType } from '@eleon/primeng-ui.lib';
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib'
import { ILocalizationService } from '@eleon/angular-sdk.lib';

interface BackgroundJobDetails {
  data: FullServiceDto;
}

@Component({
  standalone: false,
  selector: 'app-services-details',
  templateUrl: './services-details.component.html',
  styleUrls: ['./services-details.component.scss']
})

export class ServicesDetailsComponent implements OnInit {
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  viewportBreakpoints = viewportBreakpoints;
  details: BackgroundJobDetails;
  totalRecords: number;
  rows: number = 10;
  lastLazyLoadEvent?: LazyLoadEvent = null;
  selectedReport: ServiceModuleDto;
  activeTab: string = 'details';
	templateType: DocumentTemplateType = DocumentTemplateType.Json;
  title: string = 'ServicesModule::Details';

  lastManifestLoadEvent: LazyLoadEvent | null;
  manifestHistoriesTotalRecords: number = 0;
  manifestHistories: ManifestHistoryDto[] = [];

  serviceId: string = '';

	@PageControls() controls = contributeControls([
		PAGE_CONTROLS.RELOAD({
        key: 'ServicesModule::Refresh',
      show: () => true,
      loading: () => this.loading,
      action: () => this.loadService(),
      disabled: () => this.loading,
    })
	]);

  constructor(
    public localizationService: ILocalizationService,
    public router: Router,
    public route: ActivatedRoute,
    public messageService: LocalizedMessageService,
		private servicesService: ServicesService,
    private manifestService: ManifestHistoriesService
  ) { }

  ngOnInit(): void {
    this.loadService();
    this.title = this.localizationService.instant('ServicesModule::Details');
  }

	

  loadService(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.serviceId = params['id'];
        this.loading = true;
        this.servicesService
          .getById(params['id'])
					.pipe(finalize(() => this.loading = false),
							handleError(err => this.messageService.error(err.message)))
          .subscribe(data => {
							this.details = {
                data: data,
              };

              this.title = this.localizationService.instant('ServicesModule::Details:WithName', data.serviceName);
            });

        this.loadManifestHistories()
      }
    });
  }

  loadManifestHistories(event?: LazyLoadEvent) {
    if (event) {
      this.lastManifestLoadEvent = event;
    }



    this.manifestService.getList({
          serviceId: this.serviceId,
          maxResultCount: this.lastManifestLoadEvent?.rows || 10,
          skipCount: this.lastManifestLoadEvent?.first || 0,
        })
        .subscribe(res => {
          this.manifestHistories = res.items;
          this.manifestHistoriesTotalRecords = res.totalCount;
        });
  }

  onActiveChange(event: any) {
    if (this.details && this.details.data) {
      this.servicesService.setActive(this.details.data.id, event)
        .pipe(first(),
          handleError(err => this.messageService.error(err.message))) 
        .subscribe(() => {
          this.messageService.success(
            this.localizationService.instant('ServicesModule::Details:ActivationStatusChangedSuccess')
          );
        });
    }
  }

  showModuleDetailsDialog = false;
  selectedModule: ServiceModuleDto = null;
  selectModule(row: { data: ServiceModuleDto }) {
    this.selectedModule = row.data;
    this.showModuleDetailsDialog = true;
  }


  colorOfRow(row: ServiceModuleDto){
    var tmp = this.selectedReport != null && row != null && this.selectedReport?.id == row?.id;
    return tmp;
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
   return this.localizationService.instant('HealthCheckModule::Status:OK');
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

  showMessageDetailsDialog = false;
	selectedMessage: ManifestHistoryDto = null;

	openMessageDetails(message: ManifestHistoryDto){
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

  getEmptyMessage(){
    return 'ServicesModule::Details:NoRows';
  }


  showManifestHistoryDialog = false;
  selectedManifestHistory: ManifestHistoryDto = null;

  getModuleSettingsEntries(settings?: Record<string, string> | null) {
    if (!settings) {
      return [];
    }

    return Object.entries(settings).map(([key, value]) => ({ key, value }));
  }

  formatSettingValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  formatManifest(manifest: unknown): string {
    if (!manifest) {
      return '';
    }

    if (typeof manifest !== 'string') {
      try {
        return JSON.stringify(manifest, null, 2);
      } catch {
        return String(manifest);
      }
    }

    try {
      return JSON.stringify(JSON.parse(manifest), null, 2);
    } catch {
      return manifest;
    }
  }

  showManifestHistory(item: { data: ManifestHistoryDto }) {
    this.selectedManifestHistory = { ...item.data, manifest: this.formatManifest(item.data.manifest) };
    this.showManifestHistoryDialog = true;
  }
}
