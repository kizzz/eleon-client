import { ISignalRConnector } from '@eleon/contracts.lib'
import { HubConnectionBuilder, IHttpConnectionOptions, HubConnection } from "@microsoft/signalr";

export class SignalRConnector implements ISignalRConnector {
  private hubConnection: HubConnection;

  constructor(
  ) {}

  public startConnection = (url: string) => {
    // const url = this.getHubUrl(hubRoute);
    if (url.startsWith('/')) {
      url = window.location.protocol + '//' + window.location.host + url;
    }
    const options: IHttpConnectionOptions = {
      accessTokenFactory: () => window['getUserToken'](),
    };

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(url, options)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log("SignalR connection started");
      })
      .catch((err) => {
        console.error("Error while starting SignalR connection:", err);
      });
  };

  public addMessageListener = (
    methodName: string,
    callback: (...args: any[]) => void
  ) => {
    this.hubConnection?.on(methodName, callback);
  };

  public sendMessage = (methodName: string, ...args: any[]) => {
    this.hubConnection?.invoke(methodName, ...args).catch((err) => {
      console.error("Error while sending SignalR message:", err);
    });
  };

  public stopConnection = () => {
    this.hubConnection
      .stop()
      .then(() => {
        console.log("SignalR connection stopped");
      })
      .catch((err) => {
        console.error("Error while stopping SignalR connection:", err);
      });
    };
    
  public removeMessageListener = (
    methodName: string,
    callback: (...args: any[]) => void
  ) => {
    this.hubConnection?.off(methodName, callback);
  }
}
