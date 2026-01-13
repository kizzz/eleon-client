import { Injectable } from "@angular/core";
import {
  PushNotificationDto,
} from '@eleon/notificator-proxy';
import {   
  ISignalRService,
  ISignalRConnector,
} from '@eleon/angular-sdk.lib';import { extractApiBase } from '@eleon/angular-sdk.lib';
import { Subject } from "rxjs";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';

const CONFIG = {
  ROUTE: "/hubs/notificator/push-notifications-hub",
  METHODS: {
    NotifyUser: "NotifyUser",
  },

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

@Injectable({
  providedIn: "root",
})
export class NotificationHubService {
  private notificationSubject = new Subject<PushNotificationDto>();
  public notification$ = this.notificationSubject.asObservable();

  private connector: ISignalRConnector;

  constructor(private signalRService: ISignalRService, private config: IApplicationConfigurationManager) {
    this.initConnection();
  }

  private initConnection() {
    const connector = this.signalRService.startConnection(CONFIG.getRoute());

    connector.addMessageListener(CONFIG.METHODS.NotifyUser, (newLog) => {
      const appName = newLog.applicationName?.toLowerCase();
      const currentAppName = this.config.getAppConfig()?.applicationName?.toLowerCase();

      if (!appName || appName == currentAppName){
        this.notificationSubject.next(newLog); 
      }
    });
  }
}
