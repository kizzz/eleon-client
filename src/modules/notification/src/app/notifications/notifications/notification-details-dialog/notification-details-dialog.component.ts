import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { NotificationLogDto } from "@eleon/notificator-proxy";


import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-notification-details-dialog",
  templateUrl: "./notification-details-dialog.component.html",
  styleUrls: ["./notification-details-dialog.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDetailsDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() notification: NotificationLogDto | null = null;

  @Output() closed = new EventEmitter<void>();

  constructor(
    public localizationService: ILocalizationService,
  ) {}

  handleVisibleChange(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(visible);
  }

  handleHide(): void {
    this.closed.emit();
  }

  getContentLocalization(notification: NotificationLogDto): string {
    if (notification.isLocalizedData){
      return notification?.content;
    }

    const params = notification.languageKeyParams?.split(';') || [];

    const result = this.localizationService.instant(notification.content, ...params);

    return result;
  }
}
