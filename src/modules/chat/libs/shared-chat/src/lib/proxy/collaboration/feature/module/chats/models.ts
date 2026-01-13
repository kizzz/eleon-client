import type { ChatMemberRole } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-member-role.enum';

export interface ChatMemberInfo {
  name?: string;
  userName?: string;
  id?: string;
  picture?: string;
  role: ChatMemberRole;
}
