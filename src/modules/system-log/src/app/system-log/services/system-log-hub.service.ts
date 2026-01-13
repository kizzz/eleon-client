import { Injectable } from "@angular/core";
import {   
  ISignalRService,
  ISignalRConnector,
} from '@eleon/angular-sdk.lib';
import { extractApiBase } from '@eleon/angular-sdk.lib';
import { Subject } from "rxjs";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { SystemLogDto } from "@eleon/system-log-proxy";

const CONFIG = {
  ROUTE: "/hubs/SystemLog/SystemLog",
  METHODS: {
    PushSystemLog: "PushSystemLog",
  },

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

@Injectable({
  providedIn: "root",
})
export class SystemLogHubService {
  private systemLogSubject = new Subject<SystemLogDto>();
  public systemLog$ = this.systemLogSubject.asObservable();

  private connector: ISignalRConnector;

  constructor(private signalRService: ISignalRService, private config: IApplicationConfigurationManager) {
    this.initConnection();
  }

  private initConnection() {
    const connector = this.signalRService.startConnection(CONFIG.getRoute());

    connector.addMessageListener(CONFIG.METHODS.PushSystemLog, (newLog) => {
      const appName = newLog.applicationName?.toLowerCase();
      const currentAppName = this.config.getAppConfig()?.applicationName?.toLowerCase();

      if (!appName || appName == currentAppName){
        this.systemLogSubject.next(newLog); 
      }
    });
  }
}
