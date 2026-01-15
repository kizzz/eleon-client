import { Component, HostListener, Input, OnInit } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { NotificationType } from '@eleon/notificator-proxy';
import { NotificationLogService } from '@eleon/notificator-proxy';
import { LazyLoadEvent } from "primeng/api";
import { Subscription, finalize } from "rxjs";


import { PushNotificationsHelperService } from "../../notifications-service/push-notifications-helper.service";
import { ActivatedRoute, Params } from "@angular/router";

import { ILocalizationService, NotificationLogDto, ILayoutService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-notifications-dashboard",
  templateUrl: "./notifications-dashboard.component.html",
  styleUrls: ["./notifications-dashboard.component.scss"],
})
export class NotificationsDashboardComponent implements OnInit {
  private unreadNotifications: NotificationLogDto[];
  private lastLoadEvent: LazyLoadEvent | null;
  private reloadedSinceLastNotificationsChange: boolean = true;

  public rowsCount: number = 15;
  public totalRecords: number = 0;
  public notifications: NotificationLogDto[] = [];
  public loading: boolean = false;
  public firstRowIx: number = 0;
  unreadNotificationsSub: Subscription;
  datesRange: Date[] = null;
  windowResized: boolean = false;
  @Input()
  showTitle: boolean = true;
  markAsRead: boolean = false;
  showNotificationDetailsDialog: boolean = false;
  selectedNotification: NotificationLogDto | null = null;

  get pageLinks() {
    return this.layoutService.isMobile() ? 2 : 5;
  }

  constructor(
    private notificationHelper: PushNotificationsHelperService,
    private notificationLogService: NotificationLogService,
    public layoutService: ILayoutService,
    public localizationService: ILocalizationService,
    private route: ActivatedRoute,
		private config: IApplicationConfigurationManager
  ) {}

  ngOnInit(): void {
    this.listenUnread();
    this.route.queryParams.subscribe((params: Params) => {
      const action = params['action'];
      if(action === 'checkAllNotifications'){
        this.markAsRead = true;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowResized = true;
        setTimeout(() => {
          this.windowResized = false;
      }, 1000);
  }

  public loadNotifications(event: LazyLoadEvent): void {
    if (this.windowResized) {
      return; 
  }

    this.lastLoadEvent = event;
    // const sortField: string = event.sortField || "CreationTime";
    // const sortOrder: string =
    //   sortField === "CreationTime"
    //     ? "desc"
    //     : event.sortOrder > 0
    //     ? "asc"
    //     : "desc";
    // const sorting: string = sortField + " " + sortOrder;

    let dateFrom = this.datesRange?.[0]?.toDateString() || null;
    let dateTo = this.datesRange?.[1]?.toDateString() || null;

    if (!dateFrom && dateTo) {
      this.datesRange[0] = this.datesRange?.[1];
    } else if (!dateTo && dateFrom) {
      this.datesRange[1] = this.datesRange?.[0];
    }
    this.loading = true;
    this.notificationLogService
      .getNotificationLogListByRequest({
        skipCount: event?.first,
        maxResultCount: this.rowsCount,
				applicationName: this.getApplicationName(),
        sorting: "CreationTime desc",
        typeFilter: [NotificationType.Push],
        fromDate:dateFrom,
        toDate:dateTo
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((x) => {
        this.totalRecords = x.totalCount;
        this.notifications = x.items;
        this.reloadedSinceLastNotificationsChange = true;
        //this.updateUnreadNotifications();
        // if (this.firstRowIx === 0) {
        //   const latest = this.unreadNotifications.find(
        //     (x) => !!this.notifications.find((y) => y.data.id === x.id)
        //   );
        //   if (latest) {
        //     this.notificationHelper.ackNotification(latest.id);
        //   }
        // }
      });
  }
	
	private getApplicationName(){
		return this.config.getAppConfig()?.applicationName;
	}

  public reloadNotifications() {
    if (this.lastLoadEvent != null) {
      this.firstRowIx = 0;
      this.loadNotifications({
        first: 0,
        filters: {},
        globalFilter: '',
      })
    }
  }

  private listenUnread(): void {
    this.unreadNotificationsSub =
      this.notificationHelper.unreadNotifications$.subscribe(
        (notifications) => {
          this.unreadNotifications = notifications;
          this.updateUnreadNotifications();
        }
      );
  }

  private updateUnreadNotifications() {
    if (
      !this.unreadNotifications ||
      !this.notifications ||
      !this.reloadedSinceLastNotificationsChange
    ) {
      return;
    }

    this.reloadedSinceLastNotificationsChange = false;

    for (const notification of this.notifications) {
      const unread = this.unreadNotifications.find(
        (x) => x.id === notification.id
      );
      notification.isRead = !unread;
    }

    if(this.markAsRead){
      this.notificationHelper.ackNotifications(this.unreadNotifications.map(x => x.id));
    }
  }

  getContentLocalization(row:NotificationLogDto): string {
    if (row.isLocalizedData){
      return row?.content;
    }

    let params = row.languageKeyParams?.split(';') || [];

    const result = this.localizationService.instant(row.content, ...params);

    return result;
  }

  paginate(event){
    this.rowsCount = event?.rows;
  }

openNotificationDetails(row: any) {
  this.selectedNotification = row;
  this.showNotificationDetailsDialog = true;
}

  onNotificationDetailsDialogClosed(): void {
    this.selectedNotification = null;
    this.showNotificationDetailsDialog = false;
  }
}
