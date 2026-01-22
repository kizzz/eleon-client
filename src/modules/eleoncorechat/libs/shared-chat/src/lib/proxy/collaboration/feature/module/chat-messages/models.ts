import type { ChatMessageSenderType } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-message-sender-type.enum';
import type { ChatMessageType } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-message-type.enum';
import type { ChatMessageSeverity } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-message-severity.enum';
import type { ChatMemberInfo } from '../chats/models';

export interface ChatMessageDto {
  creationTime?: string;
  id?: string;
  sender?: string;
  senderType: ChatMessageSenderType;
  type: ChatMessageType;
  severity: ChatMessageSeverity;
  content?: string;
  chatRoomId?: string;
  unread: boolean;
  outcoming: boolean;
  senderInfo: ChatMemberInfo;
}
