import { ISignalRConnector, ISignalRService } from '@eleon/contracts.lib'
import { SignalRConnector } from '@eleon/ts-hosting.lib';

export class SignalRService extends ISignalRService {
  constructor(
  ) {
    super();
  }

  override createConnector(): ISignalRConnector {
    return new SignalRConnector();
  }

  override startConnection(
    hubRoute: string,
    authRequired = true
  ): ISignalRConnector {
    const connector = this.createConnector();
    const authorized = !authRequired || window['getUserToken']();
    if (authorized) {
      connector.startConnection(hubRoute);
    }

    return connector;
  }
}
