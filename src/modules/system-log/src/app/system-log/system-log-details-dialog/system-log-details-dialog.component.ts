import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FullSystemLogDto,
  SystemLogLevel,
} from '@eleon/system-log-proxy';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  selector: 'app-system-log-details-dialog',
  standalone: false,
  templateUrl: './system-log-details-dialog.component.html',
  styleUrls: ['./system-log-details-dialog.component.scss'],
})
export class SystemLogDetailsDialogComponent {
  @Input() log: FullSystemLogDto | null = null;
  @Input() visible = false;
  @Input() isMobile = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() hide = new EventEmitter<void>();
  @Output() readStatusChange = new EventEmitter<void>();
  systemLogLevel = SystemLogLevel;

  constructor(private localizationService: ILocalizationService) {}

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }

  onHide(): void {
    this.hide.emit();
  }

  onReadStatusChange(): void {
    this.readStatusChange.emit();
  }

  get hasExtraProperties(): boolean {
    const extraProps = this.log?.extraProperties;
    return !!extraProps && Object.keys(extraProps).length > 0;
  }

  getSeverity(level?: SystemLogLevel | null): string {
    switch (level) {
      case SystemLogLevel.Info:
        return 'info';
      case SystemLogLevel.Warning:
        return 'warn';
      case SystemLogLevel.Critical:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getSeverityLabel(level?: SystemLogLevel | null): string {
    switch (level) {
      case SystemLogLevel.Info:
        return this.localizationService.instant('SystemLog::LogLevel:Info');
      case SystemLogLevel.Warning:
        return this.localizationService.instant('SystemLog::LogLevel:Warning');
      case SystemLogLevel.Critical:
        return this.localizationService.instant('SystemLog::LogLevel:Critical');
      default:
        return this.localizationService.instant('SystemLog::LogLevel:Unknown');
    }
  }
}
