import { Component, EventEmitter, HostBinding, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from "@angular/core";
import { NotificationPriority, PushNotificationDto } from '@eleon/notificator-proxy';
import { NotificationHubService } from '../notifications-service/notification-hub.service'
import { MessageService } from 'primeng/api'

import { ILocalizationService, NotificationLogDto } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-notification-message-toast",
  templateUrl: "./notification-message-toast.component.html",
  styleUrls: ["./notification-message-toast.component.scss"],
})
export class NotificationMessageToastComponent implements OnInit {
  constructor(
		private messageService: MessageService,
		private notificationHubService: NotificationHubService,
    private localizationService: ILocalizationService
	) 
	{
  }

	ngOnInit(): void {
		this.notificationHubService.notification$.subscribe(message => {
      if (message.isNewMessage === false) {
        return;
      }
			this.pushMessage(message);
});
	}

	pushMessage(message: PushNotificationDto){
    const severity = message.priority == NotificationPriority.High ? 'warn' : 'info';
		this.messageService.add({ key: 'notification-message', sticky: true, severity: severity, data: { icon: this.getIcon(message), content: this.getLocalizedMessage(message) } })
	}

  getIcon(message: PushNotificationDto): string {
    switch (message.priority) {
      case NotificationPriority.High:
        return 'fa fa-exclamation-triangle';
      case NotificationPriority.Normal:
        return 'fa fa-bell';
      default:
        return 'fa fa-bell';
    }
  }

  getLocalizedMessage(message: PushNotificationDto): string {
    console.log(message);
    if (message.isLocalizedData){
      return message.content;
    }
    
    return this.localizationService.instant(message.content, ...message.dataParams);
  }
}
