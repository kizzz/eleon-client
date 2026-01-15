import { Injectable } from "@angular/core";
import {   
  ISignalRService,
  ISignalRConnector,
} from '@eleon/angular-sdk.lib';
import { Subject } from "rxjs";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { TaskHeaderDto } from "@eleon/job-scheduler-proxy";
import { extractApiBase } from '@eleon/angular-sdk.lib'

const CONFIG = {
  ROUTE: "/hubs/JobScheduler/TaskHub",
  METHODS: {
    TaskCompleted: "TaskCompleted",
  },

	getRoute(){
		return extractApiBase('eleonsoft') + CONFIG.ROUTE;
	}
};

@Injectable({
  providedIn: "root",
})
export class TaskHubService {
  private taskCompletedSubject = new Subject<TaskHeaderDto>();
  public taskCompleted$ = this.taskCompletedSubject.asObservable();

  private connector: ISignalRConnector;

  constructor(private signalRService: ISignalRService, private config: IApplicationConfigurationManager) {
    this.initConnection();
  }

  private initConnection() {
    const connector = this.signalRService.startConnection(CONFIG.getRoute());

    connector.addMessageListener(CONFIG.METHODS.TaskCompleted, (updatedTask) => {
      const appName = updatedTask.applicationName?.toLowerCase();
      const currentAppName = this.config.getAppConfig()?.applicationName?.toLowerCase();

      if (!appName || appName == currentAppName){
        this.taskCompletedSubject.next(updatedTask); 
      }
    });
  }
}
