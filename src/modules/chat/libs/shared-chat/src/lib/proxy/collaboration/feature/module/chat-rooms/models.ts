import type { ChatRoomType } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-room-type.enum';
import type { ChatRoomStatus } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-room-status.enum';
import type { ChatMemberInfo } from '../chats/models';
import type { ChatMemberRole } from '../../../../module-collector/collaboration-module/collaboration/feature/module/domain/shared/constants/chat-member-role.enum';
import type { PagedAndSortedResultRequestDto } from '@eleon/proxy-utils.lib';

export interface ChatRoomDto {
  id?: string;
  name?: string;
  refId?: string;
  type: ChatRoomType;
  creationTime?: string;
  status: ChatRoomStatus;
  chatMembersPreview: ChatMemberInfo[];
  membersAmount: number;
  description?: string;
  tags: string[];
  isPublic: boolean;
  defaultRole: ChatMemberRole;
}

export interface ChatListRequestDto extends PagedAndSortedResultRequestDto {
  nameFilter?: string;
}

export interface CreateChatRequestDto {
  chatName?: string;
  initialMembers: Record<string, ChatMemberRole>;
  isPublic: boolean;
  tags: string[];
  allowedRoles: string[];
  allowedOrgUnits: string[];
  defaultRole: ChatMemberRole;
  setOwner: boolean;
}
