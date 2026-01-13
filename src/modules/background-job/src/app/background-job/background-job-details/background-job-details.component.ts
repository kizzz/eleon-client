import {
  BackgroundJobMessageDto,
  BackgroundJobMessageType,
} from '@eleon/background-jobs-proxy';
import { Component, OnInit } from '@angular/core';
import { BackgroundJobStatus } from '@eleon/background-jobs-proxy';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { viewportBreakpoints } from '@eleon/angular-sdk.lib';
import { BackgroundJobService } from '@eleon/background-jobs-proxy';
import {
  BackgroundJobDto,
  BackgroundJobExecutionDto,
} from '@eleon/background-jobs-proxy';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { finalize, first } from 'rxjs/operators';
import { DocumentTemplateType } from '@eleon/primeng-ui.lib';
import {
  contributeControls,
  PAGE_CONTROLS,
  PageControls,
} from '@eleon/primeng-ui.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { BackgroundJobHubService } from '../../backgorund-job-services/background-job-hub.service';
interface BackgroundJobDetails {
  data: BackgroundJobDto;
  executions: BackgroundJobExecutionDto[];
}

@Component({
  standalone: false,
  selector: 'app-background-job-details',
  templateUrl: './background-job-details.component.html',
  styleUrls: ['./background-job-details.component.scss'],
})
export class BackgroundJobDetailsComponent implements OnInit {
  loading: boolean = false;
  lastLoadEvent: LazyLoadEvent | null;
  localizedBackgroundJobStatuses: {
    jobStatus: BackgroundJobStatus;
    name: string;
  }[];
  BackgroundJobStatus = BackgroundJobStatus;
  viewportBreakpoints = viewportBreakpoints;
  dateRangeFilter: Date[];
  details: BackgroundJobDetails;
  totalRecords: number;
  rows: number = 10;
  lastLazyLoadEvent?: LazyLoadEvent = null;
  selectedExecution: BackgroundJobExecutionDto;
  templateType: DocumentTemplateType = DocumentTemplateType.Json;
  lastErrorMessage: BackgroundJobMessageDto = null;
  activeTabIndex: number = 0;
  changeExetutionsLoading: boolean = false;

  BackgroundJobMessageType = BackgroundJobMessageType;

  @PageControls() controls = contributeControls([
    {
      key: 'BackgroundJob::BackgroundJobs:Stop',
      icon: 'fa fa-times',
      severity: 'danger',
      show: () =>
        !!this.details?.data &&
        (this.details.data.status == BackgroundJobStatus.Executing ||
          this.details.data.status == BackgroundJobStatus.Retring),
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.cancelJob(),
    },
    {
      key: 'BackgroundJob::BackgroundJobs:Retry',
      icon: 'fa fa-sync',
      severity: 'warning',
      show: () => this.allowRetry(),
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.retryJob(),
    },
    PAGE_CONTROLS.RELOAD({
      key: 'JobScheduler::Refresh',
      show: () => true,
      loading: () => this.loading,
      action: () => this.loadBackgroundJob(this.details.data.id),
      disabled: () => this.loading,
    }),
  ]);

  constructor(
    private backroundJobHub: BackgroundJobHubService,
    public backgroundJobService: BackgroundJobService,
    public localizationService: ILocalizationService,
    public confirmationService: ConfirmationService,
    public router: Router,
    public route: ActivatedRoute,
    public messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    this.subscribeToRoute();
    this.subscribeToJobUpdate();

    this.localizedBackgroundJobStatuses = Object.keys(BackgroundJobStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        jobStatus:
          BackgroundJobStatus[name as keyof typeof BackgroundJobStatus],
        name: this.localizationService.instant(
          `Infrastructure::BackgroundJobStatus:${name}`
        ),
      }));
  }

  orderExecutionsMessages(executions: BackgroundJobExecutionDto[]): void {
    executions.forEach((execution) => {
      execution.messages = execution.messages?.sort((a, b) =>
        b.creationTime.localeCompare(a.creationTime)
      );
    });
  }

  loadBackgroundJob(id: string) {
    this.loading = true;
    this.backgroundJobService
      .getBackgroundJobById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.orderExecutionsMessages(data.executions);

          this.details = {
            data: data,
            executions: data.executions,
          };
          if (this.details.executions?.length > 0) {
            this.details.executions.sort((a, b) => {
              return b.creationTime.localeCompare(a.creationTime);
            });
            this.selectedExecution = this.details.executions[0];
          }
          if (
            this.details.data.status == 3 &&
            this.details.data.executions?.length > 0
          ) {
            let onlyErrored = this.details.data.executions?.filter(
              (x) => x.status == 3
            );
            if (onlyErrored.length > 0) {
              let sortedByExDate = onlyErrored.sort(
                (a, b) =>
                  new Date(b.executionEndTimeUtc).getTime() -
                  new Date(a.executionEndTimeUtc).getTime()
              );
              this.lastErrorMessage = sortedByExDate[0]?.messages[0];
            }
          }
        },
      });
  }

  subscribeToRoute(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.loadBackgroundJob(params['id']);
      }
    });
  }

  getBackgroundJobStatusName(status: number) {
    return this.localizationService.instant(
      'Infrastructure::BackgroundJobStatus:' + BackgroundJobStatus[status]
    );
  }

  getBackgroundJobTypeName(type: any) {
    return type;
  }

  getDocumentObjectTypeName(status: any) {
    return status;
  }

  select(row) {
    this.selectedExecution = row;
    this.activeTabIndex = 0;
    this.changeExetutionsLoading = true;

    setTimeout(() => {
      this.changeExetutionsLoading = false;
    }, 500);
  }

  colorOfRow(row) {
    var tmp =
      this.selectedExecution != null &&
      row != null &&
      this.selectedExecution == row;
    return tmp;
  }

  retryJob() {
    this.confirmationService.confirm({
      header: this.localizationService.instant('Infrastructure::Warning'),
      message: this.localizationService.instant('BackgroundJob::RetryJobConfirm'),
      accept: () => {
        this.loading = true;
        this.backgroundJobService
          .retryBackgroundJob(this.details.data.id)
          .subscribe({
            next: (reply) => {
              if (reply) {
                this.messageService.success('BackgroundJob::RetrySuccess');
                this.router.navigate(['/background-job/dashboard']);
              } else {
                this.messageService.error('BackgroundJob::RetryFail');
              }
              this.loading = false;
            },
            error: () => {
              this.messageService.error('BackgroundJob::RetryError');
              this.loading = false;
            },
          });
      },
      reject: () => {
        return;
      },
      acceptLabel: this.localizationService.instant('Infrastructure::Yes'),
      rejectLabel: this.localizationService.instant('Infrastructure::No'),
      acceptButtonStyleClass:
        'p-button-sm p-button-raised p-button-text p-button-info',
      rejectButtonStyleClass:
        'p-button-sm p-button-raised p-button-text p-button-danger',
    });
  }

  allowRetry() {
    if (!this.details?.data?.isRetryAllowed) return false;
    if (
      [BackgroundJobStatus.Cancelled, BackgroundJobStatus.Errored].includes(
        this.details?.data?.status
      )
    ) {
      return true;
    }
    return false;
  }

  cancelJob() {
    this.confirmationService.confirm({
      header: this.localizationService.instant('Infrastructure::Warning'),
      message: this.localizationService.instant('BackgroundJob::CancelJobConfirm'),
      accept: () => {
        this.loading = true;
        this.backgroundJobService
          .cancelBackgroundJob(this.details.data.id)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (reply) => {
              if (reply) {
                this.messageService.success('BackgroundJob::CancelSuccess');
                this.router.navigate(['/background-job/dashboard']);
              } else {
                this.messageService.error('BackgroundJob::CancelFail');
              }
            },
            error: () => {
              this.messageService.error('BackgroundJob::CancelError');
            },
          });
      },
      reject: () => {
        return;
      },
      acceptLabel: this.localizationService.instant('Infrastructure::Yes'),
      rejectLabel: this.localizationService.instant('Infrastructure::No'),
      acceptButtonStyleClass:
        'p-button-sm p-button-raised p-button-text p-button-info',
      rejectButtonStyleClass:
        'p-button-sm p-button-raised p-button-text p-button-danger',
    });
  }

  showMessageDetailsDialog = false;
  selectedMessage: BackgroundJobMessageDto = null;

  openMessageDetails(message: BackgroundJobMessageDto) {
    this.selectedMessage = message;
    this.showMessageDetailsDialog = true;
  }

  getJobFinished() {
    if (
      this.details?.data.lastExecutionDateUtc &&
      this.details?.data?.jobFinishedUtc
    ) {
      return (
        this.details?.data?.jobFinishedUtc >=
        this.details?.data?.lastExecutionDateUtc
      );
    }
    return undefined;
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
      if (this.details?.data?.id === job.id) {
        this.loadBackgroundJob(this.details.data.id);
      }
    })
  }
}
