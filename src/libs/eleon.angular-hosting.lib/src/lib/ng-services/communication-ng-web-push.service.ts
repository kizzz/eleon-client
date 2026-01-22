import { Injectable, Optional } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { IAuthManager } from '@eleon/contracts.lib';
import { WebPushService } from '@eleon/system-services.lib';
import { ErrorHandlingLevel } from '@eleon/contracts.lib';
import { IApplicationConfigurationManager, ICommunicationManager } from '@eleon/contracts.lib';
import { firstValueFrom } from "rxjs/internal/firstValueFrom";

@Injectable({
  providedIn: "root",
})
export class NgWebPushCommunicationService extends ICommunicationManager {
  constructor(
    @Optional() private webPushService: WebPushService,
    @Optional() private swPush: SwPush,
    private authService: IAuthManager,
    private configManger: IApplicationConfigurationManager
  ) {
    super();

		if  (!this.webPushService || !this.swPush) {
			if (typeof window['addEleoncoreError'] === 'function') {
				window.addEleoncoreError({
					message: `${ this.webPushService && this.swPush ? "WebPushService and SwPush are" : !this.webPushService ? "WebPushService is" : "SwPush is" } not provided. Please ensure that Service Worker is enabled in your application.`,
					level: ErrorHandlingLevel.Debug
				});
			}
		}
  }

  async init(...params: any[]) {
		if  (!this.webPushService || !this.swPush) {
			if (typeof window['addEleoncoreError'] === 'function') {
				window.addEleoncoreError({
					message: `${ this.webPushService && this.swPush ? "WebPushService and SwPush are" : !this.webPushService ? "WebPushService is" : "SwPush is" } not provided. Please ensure that Service Worker is enabled in your application.`,
					level: ErrorHandlingLevel.Error
				});
			}
			
			return;
		}
    await this.subscribeToNotificationsWithAuth();
		if (typeof window['addEleoncoreError'] === 'function') {
			window.addEleoncoreError({
				message: 'Initialized communication service.',
				level: ErrorHandlingLevel.Debug,
			});
		}
  }

  private async subscribeToNotificationsWithAuth() {
    const authSubscription = this.authService
        .authorized$
        .subscribe(async (r) => {
          if (r) {
            await this.subscribeToNotifications();
            authSubscription.unsubscribe();
          }
        })
  }

  private async subscribeToNotifications(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Permission to show notifications not granted");
      return false;
    }
    
    let success = false;
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.getPublicKey(),
      });

      success = await firstValueFrom(
        this.webPushService.addWebPushSubscription({
          endpoint: sub.endpoint,
          p256Dh: sub.toJSON().keys["p256dh"],
          auth: sub.toJSON().keys["auth"],
        })
      );
    } catch (error) {
      console.log("An error occured while subscribing to notifications", error);
      return false;
    }

    if (success) {
      console.log("Successfully subscribed to notifications");

      this.swPush.messages.subscribe((message: any) => {
        const title = message.Notification.Title;
        const options = {
          body: message.Notification.Body,
          icon: message.Notification.Icon,
        };
        const notification = new Notification(title, options);
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg != null) {
            reg.showNotification(title, options);
          }
        });
      });

      return true;
    } else {
      console.log("Failed to subscribe to notifications");
      return false;
    }
  }

  private getPublicKey(): string {
    return this.configManger.getAppConfig()["webPush"]["publicKey"];
  }
}
