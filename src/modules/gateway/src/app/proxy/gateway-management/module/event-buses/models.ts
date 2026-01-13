import type { EventBusProvider } from '../../../common/module/constants/event-bus-provider.enum';
import type { EventBusStatus } from '../../../common/module/constants/event-bus-status.enum';

export interface EventBusDto {
  id?: string;
  provider: EventBusProvider;
  providerOptions?: string;
  status: EventBusStatus;
  isDefault: boolean;
  name?: string;
}

export interface EventBusOptionsTemplateDto {
  provider: EventBusProvider;
  template?: string;
}
