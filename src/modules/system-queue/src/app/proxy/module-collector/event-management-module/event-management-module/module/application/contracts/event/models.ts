import type { FullEventDto } from '../../../../../../../event-management-module/module/application/contracts/event/models';

export interface RecieveMessagesResponseDto {
  queueStatus?: string;
  messagesLeft: number;
  messages: FullEventDto[];
}
