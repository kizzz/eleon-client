import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import {  BackgroundJobExecutionStatus, BackgroundJobStatus } from '@eleon/background-jobs-proxy'

import { ILocalizationService } from '@eleon/angular-sdk.lib';
interface LocalizedBackgroundJobStatus {
  name: string;
value: BackgroundJobStatus;
}

interface LocalizedBackgroundJobExecutionStatus {
  name: string;
  value: BackgroundJobExecutionStatus;
}

const icons: { [key: number]: string } = {
  [BackgroundJobStatus.Completed]: 'fas fa-check-double',
  [BackgroundJobStatus.New]: 'fas fa-plus',
  [BackgroundJobStatus.Executing]: 'fas fa-spinner fa-spin',
  [BackgroundJobStatus.Retring]: 'fas fa-sync',
  [BackgroundJobStatus.Errored]: 'fas fa-ban',
  [BackgroundJobStatus.Cancelled]: 'fas fa-x',
};

const execIcons: { [key: number]: string } = {
  [BackgroundJobExecutionStatus.Completed]: 'fas fa-check-double',
  [BackgroundJobExecutionStatus.Starting]: 'fas fa-spinner fa-spin',
  [BackgroundJobExecutionStatus.Started]: 'fas fa-spinner fa-spin',
  [BackgroundJobExecutionStatus.Cancelled]: 'fas fa-x',
  [BackgroundJobExecutionStatus.Errored]: 'fas fa-ban',
}

@Component({
  standalone: false,
  selector: 'app-background-job-status-tag',
  templateUrl: './background-job-status-tag.component.html',
  styleUrls: ['./background-job-status-tag.component.scss']
})

export class BackgroundJobStatusTagComponent implements OnInit, OnChanges {
  localizedBackgroundJobStatuses: LocalizedBackgroundJobStatus[];
	localizedBackgroundJobExecutionStatuses: LocalizedBackgroundJobExecutionStatus[];
  @Input()
  value: BackgroundJobStatus | BackgroundJobExecutionStatus;

	@Input() mode: 'execution' | 'job' = 'job';

  localizedValue: string;

  @Input()
  textBefore: string = '';
  @Input()
  textAfter: string = '';

  constructor(
    public localizationService: ILocalizationService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.setValue();
    }
  }

  get display(): boolean {
    return !isNaN(this.value);
  }

  ngOnInit(): void {
    this.localizedBackgroundJobStatuses = Object.keys(BackgroundJobStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: BackgroundJobStatus[name as keyof typeof BackgroundJobStatus],
        name: this.localizationService.instant(`Infrastructure::BackgroundJobStatus:${name}`),
      }));

		this.localizedBackgroundJobExecutionStatuses = Object.keys(BackgroundJobExecutionStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: BackgroundJobExecutionStatus[name as keyof typeof BackgroundJobExecutionStatus],
        name: this.localizationService.instant(`BackgroundJob::BackgroundJobExecutionStatus:${name}`),
      }));
      this.setValue();
  }

  setValue(): void {
		if (this.mode == 'execution'){
			const localizedValue = this.localizedBackgroundJobExecutionStatuses.find(x => x.value === this.value)?.name;
			this.localizedValue = localizedValue ? this.textBefore + localizedValue + this.textAfter : undefined;
		}
		else{
			const localizedValue = this.localizedBackgroundJobStatuses.find(x => x.value === this.value)?.name;
			this.localizedValue = localizedValue ? this.textBefore + localizedValue + this.textAfter : undefined;
		}
  }

  getIcon() {
    return this.mode === 'execution' ? execIcons[this.value] : icons[this.value];
  }

  getStyleClass() {
    return this.mode === 'execution' ? BackgroundJobExecutionStatus[this.value]?.toLowerCase() : BackgroundJobStatus[this.value]?.toLowerCase();
  }
}
