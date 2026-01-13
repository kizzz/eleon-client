import type { ChatMemberRole } from '../../../domain/shared/constants/chat-member-role.enum';

export interface UpdateChatRequestDto {
  chatId?: string;
  chatName?: string;
  tags: string[];
  isPublic: boolean;
  defaultRole: ChatMemberRole;
}
