import { ChatInteractionService } from './collaboration/feature/module/controllers/chat-interaction.service';
import { ChatMemberService } from './collaboration/feature/module/controllers/chat-member.service';
import { ChatRoomService } from './collaboration/feature/module/controllers/chat-room.service';
import { DocumentConversationService } from './collaboration/feature/module/controllers/document-conversation.service';
import { SupportTicketService } from './collaboration/feature/module/controllers/support-ticket.service';
import { UserChatSettingService } from './collaboration/feature/module/controllers/user-chat-setting.service';

export const PROXY_SERVICES = [ChatInteractionService, ChatMemberService, ChatRoomService, DocumentConversationService, SupportTicketService, UserChatSettingService];