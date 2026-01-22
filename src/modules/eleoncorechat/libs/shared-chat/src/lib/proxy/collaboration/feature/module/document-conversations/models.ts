import type { ChatRoomDto } from '../chat-rooms/models';

export interface DocumentConversationInfoDto {
  chatRoom: ChatRoomDto;
  isMember: boolean;
}
