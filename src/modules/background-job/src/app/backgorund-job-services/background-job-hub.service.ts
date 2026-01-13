import { Injectable } from "@angular/core";
import {   
  ISignalRService,
  ISignalRConnector,
} from '@eleon/angular-sdk.lib';
import { BackgroundJobHeaderDto } from '@eleon/background-jobs-proxy';
import { Subject } from "rxjs";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { extractApiBase } from '@eleon/angular-sdk.lib'

const CONFIG = {
  ROUTE: "/hubs/BackgroundJob/BackgroundJobHub",
  METHODS: {
    JobCompleted: "JobCompleted",
  },

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

@Injectable({
  providedIn: "root",
})
export class BackgroundJobHubService {
  private backgroundJobCompletedSubject = new Subject<BackgroundJobHeaderDto>();
  public backgroundJobCompleted$ = this.backgroundJobCompletedSubject.asObservable();

  private connector: ISignalRConnector;

  constructor(private signalRService: ISignalRService, private config: IApplicationConfigurationManager) {
    this.initConnection();
  }

  private initConnection() {
    const connector = this.signalRService.startConnection(CONFIG.getRoute());

    connector.addMessageListener(CONFIG.METHODS.JobCompleted, (updatedBackgroundJob) => {
      const appName = updatedBackgroundJob.applicationName?.toLowerCase();
      const currentAppName = this.config.getAppConfig()?.applicationName?.toLowerCase();

      if (!appName || appName == currentAppName){
        this.backgroundJobCompletedSubject.next(updatedBackgroundJob); 
      }
    });
  }
}
