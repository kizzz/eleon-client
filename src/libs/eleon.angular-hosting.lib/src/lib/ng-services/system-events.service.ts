import { ISignalRConnector, IApplicationConfigurationManager, IAuthManager, ISignalRService } from '@eleon/contracts.lib'
import { ISystemEventsService } from '@eleon/contracts.lib';
import { extractApiBase } from '@eleon/angular-sdk.lib'


const SYSTEM_EVENTS_HUB_PATH = '/hubs/system/system-events-hub';


export class SystemEventsService implements ISystemEventsService {
  initialized = false;
  connector: ISignalRConnector | null = null;

  listeners: { methodName: string; callback: (...args: any[]) => void }[] = [];

  constructor(
    private appConfig: IApplicationConfigurationManager,
    private authService: IAuthManager,
    private signalRService: ISignalRService
  ) {
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.connector = this.signalRService.startConnection(extractApiBase('eleonsoft') + SYSTEM_EVENTS_HUB_PATH);

    this.authService.authorized$.subscribe(auth => {
      this.connector?.stopConnection();
      this.connector = this.signalRService.startConnection(extractApiBase('eleonsoft') + SYSTEM_EVENTS_HUB_PATH);
      this.listeners.forEach(listener => {
        this.connector?.addMessageListener(listener.methodName, listener.callback);
      });
    });

    this.initialized = true;
  }

  public subscribe(name: string, callback: (data: any) => void): () => void {
    if (!this.initialized) {
      this.initialize();
    }

    this.listeners.push({ methodName: name, callback: callback });

    if (!this.connector) {
      return () => {};
    }

    this.connector?.addMessageListener(name, callback);

    return () => {
      this.listeners = this.listeners.filter(listener => listener.methodName !== name && listener.callback !== callback);
      this.connector?.removeMessageListener(name, callback);
    }
  }
}
