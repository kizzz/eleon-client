
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { PushNotificationsHelperService } from "../../notifications-service/push-notifications-helper.service";
import { Observable, first, map } from "rxjs";
import { PushNotificationsViewerHelperService } from "../../push-notifications-viewer/push-notifications-viewer-helper.service";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { SharedModule } from "@eleon/angular-sdk.lib";
import { MessageService } from "primeng/api";
import { PushNotificationsViewerModule } from "../../push-notifications-viewer/push-notifications-viewer.module";
import { PopoverModule } from "primeng/popover";
import { TooltipModule } from "primeng/tooltip";
import { BadgeModule } from 'primeng/badge';

import { ILocalizationService, NotificationLogDto } from '@eleon/angular-sdk.lib';
@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  standalone: true,
  imports: [
    SharedModule,
    PopoverModule,
    TooltipModule,
    BadgeModule,
    PushNotificationsViewerModule,
  ],
  styleUrl: "./notifications.component.scss",
})
export class NotificationsComponent implements OnInit {
  @HostBinding("class") class =
    "menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px";
  @HostBinding("attr.data-kt-menu") dataKtMenu = "true";

  @Input()
  opened = false;

  @Output()
  viewAllNotificationsClickEvent = new EventEmitter<boolean>();
  public preventUpdates: boolean = false; 

  notificationsCountText$: Observable<string> =
    this.pushHelper.unreadNotificationsCount$.pipe(
      map((x) =>
        x > 0
          ? this.localizationService.instant(
              "NotificatorModule::NotificationsCount",
              x.toString()
            )
          : null
      )
    );

  notificationsCount$: Observable<number> = this.pushHelper.unreadNotificationsCount$;

  public notifications$: Observable<NotificationLogDto[]> = this.helper.notifications$?.pipe(
      map((notifications) => notifications.filter((notification) => !notification.isRead))
  );

  alerts: Array<AlertModel> = defaultAlerts;
  logs: Array<LogModel> = defaultLogs;

  constructor(
    private pushHelper: PushNotificationsHelperService,
    private localizationService: ILocalizationService,
    public router: Router,
    private helper: PushNotificationsViewerHelperService,
    private pageStateSerive: PageStateService,
    private msgService: MessageService
  
  ) {}

  viewAllClicked() {
    if(this.pageStateSerive.isDirty){
      this.msgService.add({
        severity: "warn",
        summary: this.localizationService.instant("Infrastructure::Warning"),
        detail: this.localizationService.instant("Infrastructure::CompleteEditingProcess"),
      });
      this.preventUpdates = true; 
      return;
    }
    
    this.preventUpdates = false;
    this.viewAllNotificationsClickEvent.emit(true);
      this.router.navigate(["/notifications/dashboard"],
        { queryParams: { action: "checkAllNotifications" } }
      );
  }

  markAsRead(notificationId?: string) {
    if (!notificationId) {
      return;
    }

    this.pushHelper.ackNotification(notificationId);
  }

  markAllAsRead(notifications: NotificationLogDto[]): void {
    const notificationIds = notifications
      ?.map((notification) => notification?.id)
      .filter((id): id is string => !!id);

    if (!notificationIds?.length) {
      return;
    }

    this.pushHelper.ackNotifications(notificationIds, { navigateAfterAck: false });
  }

  onHide() {
    this.pushHelper.isPopupOpened = false;
    this.opened = false;
  }

  onShow() {
    this.pushHelper.reloadMoreNotifications();
    this.pushHelper.isPopupOpened = true;
    this.opened = true;
  }

  ngOnInit(): void {}
  }


interface AlertModel {
  title: string;
  description: string;
  time: string;
  icon: string;
  state: "primary" | "danger" | "warning" | "success" | "info";
}

const defaultAlerts: Array<AlertModel> = [
  {
    title: "Project Alice",
    description: "Phase 1 development",
    time: "1 hr",
    icon: "icons/duotune/technology/teh008.svg",
    state: "primary",
  },
  {
    title: "HR Confidential",
    description: "Confidential staff documents",
    time: "2 hrs",
    icon: "icons/duotune/general/gen044.svg",
    state: "danger",
  },
  {
    title: "Company HR",
    description: "Corporeate staff profiles",
    time: "5 hrs",
    icon: "icons/duotune/finance/fin006.svg",
    state: "warning",
  },
  {
    title: "Project Redux",
    description: "New frontend admin theme",
    time: "2 days",
    icon: "icons/duotune/files/fil023.svg",
    state: "success",
  },
  {
    title: "Project Breafing",
    description: "Product launch status update",
    time: "21 Jan",
    icon: "icons/duotune/maps/map001.svg",
    state: "primary",
  },
  {
    title: "Banner Assets",
    description: "Collection of banner images",
    time: "21 Jan",
    icon: "icons/duotune/general/gen006.svg",
    state: "info",
  },
  {
    title: "Icon Assets",
    description: "Collection of SVG icons",
    time: "20 March",
    icon: "icons/duotune/art/art002.svg",
    state: "warning",
  },
];

interface LogModel {
  code: string;
  state: "success" | "danger" | "warning";
  message: string;
  time: string;
}

const defaultLogs: Array<LogModel> = [
  { code: "200 OK", state: "success", message: "New order", time: "Just now" },
  { code: "500 ERR", state: "danger", message: "New customer", time: "2 hrs" },
  {
    code: "200 OK",
    state: "success",
    message: "Payment process",
    time: "5 hrs",
  },
  {
    code: "300 WRN",
    state: "warning",
    message: "Search query",
    time: "2 days",
  },
  {
    code: "200 OK",
    state: "success",
    message: "API connection",
    time: "1 week",
  },
  {
    code: "200 OK",
    state: "success",
    message: "Database restore",
    time: "Mar 5",
  },
  {
    code: "300 WRN",
    state: "warning",
    message: "System update",
    time: "May 15",
  },
  {
    code: "300 WRN",
    state: "warning",
    message: "Server OS update",
    time: "Apr 3",
  },
  {
    code: "300 WRN",
    state: "warning",
    message: "API rollback",
    time: "Jun 30",
  },
  {
    code: "500 ERR",
    state: "danger",
    message: "Refund process",
    time: "Jul 10",
  },
  {
    code: "500 ERR",
    state: "danger",
    message: "Withdrawal process",
    time: "Sep 10",
  },
  { code: "500 ERR", state: "danger", message: "Mail tasks", time: "Dec 10" },
];
