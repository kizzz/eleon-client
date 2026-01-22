import type { ChatRoomType } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-room-type.enum';
import type { ChatMessageSeverity } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-message-severity.enum';
import type { ChatRoomDto } from '../chat-rooms/models';
import type { ChatMessageDto } from '../chat-messages/models';
import type { ChatMemberRole } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-member-role.enum';
import type { ChatMemberType } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-member-type.enum';

export interface ChatOrganizationUnitDto {
  id?: string;
  displayName?: string;
}

export interface LastChatsRequestDto {
  skip: number;
  take: number;
  nameFilter?: string;
  chatRoomTypes: ChatRoomType[];
  isArchived: boolean;
  isChannel: boolean;
  tags: string[];
}

export interface SendDocumentMessageRequestDto {
  chatId?: string;
  filename?: string;
  documentBase64?: string;
}

export interface SendTextMessageRequestDto {
  chatId?: string;
  message?: string;
  severity: ChatMessageSeverity;
}

export interface UserChatInfoDto {
  unreadCount: number;
  chat: ChatRoomDto;
  lastChatMessage: ChatMessageDto;
  isChatMuted: boolean;
  isArchived: boolean;
  userRole: ChatMemberRole;
  memberType: ChatMemberType;
  memberRef?: string;
  allowedOrganizationUnits: ChatOrganizationUnitDto[];
  allowedRoles: string[];
}
