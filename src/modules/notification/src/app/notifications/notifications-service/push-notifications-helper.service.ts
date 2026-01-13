import { Injectable, OnDestroy } from "@angular/core";
import {
  PushNotificationDto,
  PushNotificationService,
} from '@eleon/notificator-proxy';

import { BehaviorSubject, Subject, of, asyncScheduler } from "rxjs";
import {
  map,
  catchError,
  throttleTime,
  exhaustMap,
  takeUntil,
  filter,
  tap,
} from "rxjs/operators";
import { NotificationHubService } from './notification-hub.service';
import { Router } from "@angular/router";

import { IPushNotificationsHelperService, IApplicationConfigurationManager, NotificationLogDto, ISoundsService } from '@eleon/angular-sdk.lib';
@Injectable({
  providedIn: "root",
})
export class PushNotificationsHelperService extends IPushNotificationsHelperService implements OnDestroy {
  /** In-memory cache with the latest unread notifications (sorted by creationTime desc). */
  private notificationsCache: NotificationLogDto[] = [];

  /** Triggers for (re)loading unread notifications. Push into this on any event that should refresh the list. */
  private loadNotificationsSubject = new Subject<void>();
  private loadTotalUnreadSubject = new Subject<void>();
  public isPopupOpened: boolean = false;

  /** Lifecycle stopper for subscriptions (service can be destroyed in tests or feature modules). */
  private destroy$ = new Subject<void>();

  /** Internal subject that always emits the latest cache. */
  private notificationsSubject = new BehaviorSubject<NotificationLogDto[]>(this.notificationsCache);
  private unreadTotalSubject = new BehaviorSubject<number>(0);

  /** Public stream of unread notifications. */
  public unreadNotifications$ = this.notificationsSubject.asObservable();

  /** Public stream with unread count. */
  public unreadNotificationsCount$ = this.unreadTotalSubject.asObservable();

  constructor(
    private notificationService: PushNotificationService,
    private notificationHub: NotificationHubService,
    private soundsService: ISoundsService,
    private router: Router,
    private config: IApplicationConfigurationManager
  ) {
    super();
    // 1) Wire the "load pipeline":
    // - throttle bursts: first trigger fires immediately (leading),
    //   last trigger within the window fires at the end (trailing)
    // - while one network call is running, ignore new triggers (exhaustMap)
    this.loadNotificationsSubject.pipe(
      throttleTime(1000, asyncScheduler, { leading: true, trailing: true }),
      exhaustMap(() => this.loadNotifications$()),
      takeUntil(this.destroy$)
    ).subscribe(list => {
      // Replace cache atomically
      this.notificationsCache = list;
      this.notificationsSubject.next(this.notificationsCache);
    });
    this.loadTotalUnreadSubject.pipe(
      exhaustMap(() => this.notificationService.getTotalUnreadNotifications(this.getApplicationName())),
      takeUntil(this.destroy$)
    ).subscribe(count => {
      this.unreadTotalSubject.next(count);
    }
    )

    // 2) Listen to push notifications and trigger reloads via the same pipeline
    this.listenPushes();
    // 3) Initial load goes through the same pipeline (single path for consistency)
    // this.loadNotificationsSubject.next();

    this.loadTotalUnreadSubject.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Mark a single notification as read and update local cache optimistically. */
  public ackNotification(notificationId: string): void {
    this.notificationService
      .acknowledgeNotificationReadByNotificationLogId(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  public reloadMoreNotifications() {
    this.loadNotificationsSubject.next();
  }

  /** Mark many notifications as read and update local cache optimistically. */
  public ackNotifications(
    notificationIds: string[],
    options?: { navigateAfterAck?: boolean }
  ): void {
    if (!notificationIds?.length) {
      return;
    }

    const navigateAfterAck = options?.navigateAfterAck ?? true;

    this.notificationService
      .acknowledgeNotificationsBulkReadByNotificationLogIds(notificationIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
          if (navigateAfterAck) {
            this.router.navigate(["/notifications/dashboard"]);
          }
        });
  }

  /** Build a single Observable that fetches unread notifications. No subscriptions inside. */
  private loadNotifications$() {
    const appName = this.getApplicationName();
    return this.notificationService
      .getRecentNotifications({ applicationName: appName , maxResultCount:10})
      .pipe(
        map(res => {
          const items = res ?? [];
          return [...items].sort(
            (a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
          );
        }),
        catchError(err => {
          return of(this.notificationsCache);
        })
      );
  }

  /** Subscribe to hub pushes and trigger a batched reload. */
  private listenPushes() {
    const currentApp = this.getApplicationName()?.toLowerCase();

    this.notificationHub.notification$.pipe(
      // If your payload has applicationName, filter to avoid cross-app noise.
      filter((p: PushNotificationDto) => {
        const pushApp = p?.applicationName?.toLowerCase?.();
        return !pushApp || !currentApp || pushApp === currentApp;
      }),
      tap(() => this.soundsService.play("notification-pop")),
      takeUntil(this.destroy$)
    ).subscribe((notification) => {
      if (this.isPopupOpened && notification?.isNewMessage) {
        this.loadNotificationsSubject.next();
        this.unreadTotalSubject.next(0);
      }
      else {
        this.loadTotalUnreadSubject.next();
      }
      // Do not call load directly — always go through the throttled pipeline
    });
  }

  private getApplicationName() {
    return this.config.getAppConfig()?.applicationName;
  }
}
