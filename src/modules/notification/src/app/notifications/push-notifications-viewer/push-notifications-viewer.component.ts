import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  PushNotificationsViewerHelperService,
} from "./push-notifications-viewer-helper.service";
import { Observable, Subscription, of } from "rxjs";
import { MessageService } from "primeng/api";
import { TableLazyLoadEvent } from "primeng/table";
import { Router } from "@angular/router";
import { NotificationLogDto } from "@eleon/notificator-proxy";

@Component({
  standalone: false,
  selector: "app-push-notifications-viewer",
  templateUrl: "./push-notifications-viewer.component.html",
  styleUrls: ["./push-notifications-viewer.component.scss"],
})
export class PushNotificationsViewerComponent
  implements OnChanges, OnInit, OnDestroy
{
  public notifications$: Observable<NotificationLogDto[]> = (
    this.helper.notifications$ ?? of([])
  );

  @Input() opened = false;
  @Input() preventUpdates = false;
  @Output() markAsReadEvent = new EventEmitter<string>();

  notifications: NotificationLogDto[] = [];
  readonly rows = 15;
  readonly virtualScrollItemSize = 72;
  totalRecords = 0;
  loading = false;
  hasMore = true;
  private lastRequested = this.rows;
  private notificationsSubscription?: Subscription;

  /** ---- NEW: dialog state ---- */
  showMessageDetailsDialog = false;
  selectedNotification: NotificationLogDto | null = null;
  constructor(
    private helper: PushNotificationsViewerHelperService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.notifications$.subscribe(
      (notifications) => {
        const previousLength = this.notifications.length;
        this.notifications = notifications ?? [];

        const growth = this.notifications.length - previousLength;

        if (this.loading) {
          if (growth < this.lastRequested) {
            this.hasMore = false;
          }
          this.loading = false;
        }

        this.totalRecords = this.computeTotalRecords();
      }
    );

    // initial load
    this.triggerLoadMore(this.rows);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.preventUpdates) return;
  }

  ngOnDestroy(): void {
    this.notificationsSubscription?.unsubscribe();
  }

  loadNotifications(event: TableLazyLoadEvent): void {
    if (!this.hasMore || this.loading) return;

    const rows = event.rows ?? this.rows;
    const first = event.first ?? 0;
    const lastVisibleIndex = first + rows;

    // When approaching the end of the current list, fetch the next batch.
    if (lastVisibleIndex >= this.notifications.length - Math.floor(rows / 3)) {
      this.triggerLoadMore(rows);
    }
  }

  private triggerLoadMore(size: number): void {
    this.lastRequested = size;
    const started = this.helper.loadMore(size);
    this.loading = started;
  }

  markAsRead(notificationId: string): void {
    this.markAsReadEvent.emit(notificationId);
  }

  localizeNotificationContent(notification: NotificationLogDto): string {
    return this.helper.localizeNotificationContent(notification);
  }

  redirectByNotification(notification: NotificationLogDto): void {
    const url = notification.redirectUrl;

    if (!url) return;

    if (url.startsWith("/")) this.router.navigate([url]);
    else window.open(url, "_blank");
  }

  /** ---- NEW: open dialog when clicking row ---- */
  openNotificationDialog(notification: NotificationLogDto): void {
    this.selectedNotification = notification;
    this.showMessageDetailsDialog = true;
    this.markAsReadEvent.emit(notification.id);    
  }

  onNotificationDialogClosed(): void {
    this.selectedNotification = null;
    this.showMessageDetailsDialog = false;
  }

  private computeTotalRecords(): number {
    // Extend the virtual list slightly when more data is expected to keep the scroll event firing.
    return this.notifications.length + (this.hasMore ? this.lastRequested : 0);
  }
}
