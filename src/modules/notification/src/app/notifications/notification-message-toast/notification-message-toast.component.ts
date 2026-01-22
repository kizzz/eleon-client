import {
  Component,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  NotificationPriority,
  PushNotificationDto,
} from '@eleon/notificator-proxy';
import { NotificationHubService } from '../notifications-service/notification-hub.service';
import { MessageService } from 'primeng/api';

import {
  ILocalizationService,
  NotificationLogDto,
} from '@eleon/angular-sdk.lib';
import { ToastCloseEvent } from 'primeng/toast';
@Component({
  standalone: false,
  selector: 'app-notification-message-toast',
  templateUrl: './notification-message-toast.component.html',
  styleUrls: ['./notification-message-toast.component.scss'],
})
export class NotificationMessageToastComponent implements OnInit {
  maxMessages: number = 5;
  private messageQueue: PushNotificationDto[] = [];

  constructor(
    private messageService: MessageService,
    private notificationHubService: NotificationHubService,
    private localizationService: ILocalizationService
  ) {}

  ngOnInit(): void {
    this.notificationHubService.notification$.subscribe((message) => {
      if (message.isNewMessage === false) {
        return;
      }
      this.pushMessage(message);
    });
  }

  pushMessage(message: PushNotificationDto) {
    // Add new message to queue
    this.messageQueue.push(message);

    // If queue exceeds maxMessages, remove the oldest
    if (this.messageQueue.length > this.maxMessages) {
      this.messageQueue.shift();
    } else {
      this.messageService.add({
        key: 'notification-message',
        sticky: true,
        severity:
          message.priority == NotificationPriority.High ? 'warn' : 'info',
        data: {
          icon: this.getIcon(message),
          content: this.getLocalizedMessage(message),
        },
      });
      return;
    }

    // Clear all toasts and re-add the latest messages
    this.messageService.clear('notification-message');

    this.messageService.addAll(
      this.messageQueue.map((msg) => {
        const severity =
          msg.priority == NotificationPriority.High ? 'warn' : 'info';
        return {
          key: 'notification-message',
          sticky: true,
          severity: severity,
          data: {
            icon: this.getIcon(msg),
            content: this.getLocalizedMessage(msg),
          },
        };
      })
    );
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
    if (message.isLocalizedData) {
      return message.content;
    }

    return this.localizationService.instant(
      message.content,
      ...message.languageKeyParams
    );
  }

  onClose(event: ToastCloseEvent) {
    if (event?.message?.data == null) {
      return;
    }
    this.messageQueue = this.messageQueue.filter(
      (msg) => msg !== event.message.data
    );
  }
}
