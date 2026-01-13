
export interface AddChatMembersRequestDto {
  chatId?: string;
  userIds: string[];
}

export interface KickChatMembersRequestDto {
  chatId?: string;
  userIds: string[];
}
