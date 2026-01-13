import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatesGroupAuditReportDto } from '@eleon/lifecycle-feature-proxy';
import { LifecycleStatus } from '@eleon/contracts.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-lifecycle-report-details-dialog',
  templateUrl: './lifecycle-report-details-dialog.component.html',
  styleUrls: ['./lifecycle-report-details-dialog.component.scss'],
})
export class LifecycleReportDetailsDialogComponent {
  @Input() report: StatesGroupAuditReportDto | null = null;
  @Input() visible = false;
  @Input() isMobile = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() hide = new EventEmitter<void>();

  LifecycleStatus = LifecycleStatus;

  constructor(private localizationService: ILocalizationService) {}

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }

  onHide(): void {
    this.hide.emit();
  }

  get hasExtraProperties(): boolean {
    const extraProps = this.report?.extraProperties;
    return !!extraProps && Object.keys(extraProps).length > 0;
  }

  getStatusLabel(status?: LifecycleStatus | null): string {
    if (status === null || status === undefined) {
      return this.localizationService.instant('Lifecycle::LifecycleStatus:Unknown');
    }
    return this.localizationService.instant(`Lifecycle::LifecycleStatus:${LifecycleStatus[status]}`);
  }
  getStatusColor(status: LifecycleStatus): string {
    if (status === undefined || status === null) {
      return 'secondary';
    }
    switch (status) {
      case LifecycleStatus.New:
        return 'info'; // Blue
      case LifecycleStatus.Enroute:
        return 'warning'; // Yellow
      case LifecycleStatus.Complete:
        return 'success'; // Green
      case LifecycleStatus.Canceled:
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}


