import type { GatewayProtocol } from '../../../common/module/constants/gateway-protocol.enum';
import type { GatewayStatus } from '../../../common/module/constants/gateway-status.enum';
import type { ServiceHealthStatus } from '../../../common/module/constants/service-health-status.enum';
import type { IRemoteStreamContent } from '../../../volo/abp/content/models';
import type { GatewayRegistrationKeyStatus } from '../../../common/module/constants/gateway-registration-key-status.enum';
import type { EventBusProvider } from '../../../common/module/constants/event-bus-provider.enum';
import type { EventBusDto } from '../event-buses/models';

export interface AcceptPendingGatewayRequestDto {
  gatewayId?: string;
  name?: string;
}

export interface GatewayDto {
  id?: string;
  name?: string;
  protocol: GatewayProtocol;
  machineHash?: string;
  ipAddress?: string;
  port?: number;
  status: GatewayStatus;
  healthStatus: ServiceHealthStatus;
  lastHealthCheckTime?: string;
  eventBusId?: string;
  allowApplicationOverride: boolean;
  enableGatewayAdmin: boolean;
  selfHostEventBus: boolean;
  vpnAddress?: string;
  vpnAdapterName?: string;
  vpnAdapterGuid?: string;
  vpnPublicKey?: string;
  vpnDns?: string;
  vpnListenPort: number;
}

export interface GatewayForwardedResponseDto {
  responseId?: string;
  responseContent: IRemoteStreamContent;
}

export interface GatewayListRequestDto {
  statusFilter?: GatewayStatus;
}

export interface GatewayRegistrationKeyDto {
  key?: string;
  expiresAfterMs: number;
  status: GatewayRegistrationKeyStatus;
}

export interface GatewayRegistrationResultDto {
  clientKey?: string;
  status: GatewayStatus;
}

export interface GatewayWorkspaceDto {
  eventBusProvider: EventBusProvider;
  eventBusProviderOptionsJson?: string;
  selfHostEventBus: boolean;
  vpnAddress?: string;
  vpnPrivateKey?: string;
  vpnPublicKey?: string;
  vpnDns?: string;
  vpnListenPort: number;
  vpnAdapterName?: string;
  vpnAdapterGuid?: string;
  vpnServerAddress?: string;
  vpnServerPublicKey?: string;
}

export interface RegisterGatewayRequestDto {
  registrationKey?: string;
  machineKey?: string;
  certificateBase64?: string;
}

export interface SetGatewayHealthStatusRequestDto {
  workspaceName?: string;
  healthStatus: ServiceHealthStatus;
}

export interface UpdateGatewayRequestDto {
  gateway: GatewayDto;
  eventBus: EventBusDto;
  useDefault: boolean;
}
