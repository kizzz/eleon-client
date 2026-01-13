import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatMessageDto } from '@eleon/collaboration-proxy';

export interface VportalMessage {
  msg: ChatMessageDto;
  sending: boolean;
  groupStart: boolean;
  groupEnd: boolean;
}

export interface NebularMessage {
  data: VportalMessage;
  text: string;
  type: "text" | "file" | "map" | "quote" | "custom";
  sender: string;
}

export interface LatestChat {
  data: UserChatInfoDto;
}