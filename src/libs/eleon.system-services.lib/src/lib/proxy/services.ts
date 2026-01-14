import { SystemLogService } from './eleon/system-services/module/full/eleon/system-services-module/module/http-api/controllers/system-log.service';
import { WebPushService } from './eleon/system-services/module/full/eleon/system-services-module/module/http-api/controllers/web-push.service';

export const PROXY_SERVICES = [SystemLogService, WebPushService];