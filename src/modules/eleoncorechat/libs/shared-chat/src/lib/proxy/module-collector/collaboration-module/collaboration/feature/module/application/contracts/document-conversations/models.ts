import type { ChatMessageSeverity } from '../../../domain/shared/constants/chat-message-severity.enum';

export interface DocumentChatMessageDto {
  documentId?: string;
  documentObjectType?: string;
  localizationKey?: string;
  localizationParams: string[];
  messageSeverity: ChatMessageSeverity;
}
