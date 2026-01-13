import { EventBusService } from './gateway-management/module/controllers/event-bus.service';
import { GatewayClientService } from './gateway-management/module/controllers/gateway-client.service';
import { GatewayHttpForwardingService } from './gateway-management/module/controllers/gateway-http-forwarding.service';
import { GatewayManagementService } from './gateway-management/module/controllers/gateway-management.service';
import { GatewayStaticKeyService } from './gateway-management/module/controllers/gateway-static-key.service';

export const PROXY_SERVICES = [EventBusService, GatewayClientService, GatewayHttpForwardingService, GatewayManagementService, GatewayStaticKeyService];