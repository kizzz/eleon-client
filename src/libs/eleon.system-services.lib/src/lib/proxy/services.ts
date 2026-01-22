import { SessionService } from './eleon/system-services/module/full/eleon/system-services-module/module/http-api/controllers/session.service';
import { SystemLogService } from './eleon/system-services/module/full/eleon/system-services-module/module/http-api/controllers/system-log.service';
import { WebPushService } from './eleon/system-services/module/full/eleon/system-services-module/module/http-api/controllers/web-push.service';
import { CurrencyService } from './module-collector/infrastructure/module/infrastructure/module/http-api/currency/currency.service';

export const PROXY_SERVICES = [SessionService, SystemLogService, WebPushService, CurrencyService];