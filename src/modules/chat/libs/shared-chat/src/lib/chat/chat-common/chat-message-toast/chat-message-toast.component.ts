import { Component, EventEmitter, HostBinding, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { UserChatInfoDto, ChatMessageType } from '@eleon/collaboration-proxy';
import {
  ChatMemberRole,
  ChatRoomType,
} from '@eleon/collaboration-proxy';
import { CHAT_MODULE_CONFIG } from '@eleon/angular-sdk.lib';
import { ChatHubService, ChatPushMessage, ChatTextHelperService, LatestChatsService } from '../chat-services'
import { MessageService } from 'primeng/api'
import { ChatWidgetFlyoutService } from '../../chat-widget'

@Component({
  standalone: false,
  selector: "app-chat-message-toast",
  templateUrl: "./chat-message-toast.component.html",
  styleUrls: ["./chat-message-toast.component.scss"],
})
export class ChatMessageToastComponent implements OnInit {
	showToast: boolean = true;
	maxMessages: number = 3;

  constructor(
		@Inject(CHAT_MODULE_CONFIG) @Optional() private config: any,
		private messageService: MessageService,
		private chatHubService: ChatHubService,
		private flyoutService: ChatWidgetFlyoutService,
		private appconfig: IApplicationConfigurationManager,
		private latestChatService: LatestChatsService,
		private chatMessageHelper: ChatTextHelperService

		// private chatService: IChatService
	) 
	{
		this.showToast = this.config?.toast?.show || true;
		this.maxMessages = this.config?.toast?.maxMessages || 3;
  }

	ngOnInit(): void {
		this.chatHubService.messageReceived$.subscribe(message => {
			console.log("Chat message received:", message);

			const currentUserId = this.appconfig.getAppConfig()?.currentUser?.id;

			if (!message?.message?.sender || message.message.sender === currentUserId || (message as any)?.mutedUsers?.includes(currentUserId)) {
				return;
			}

			if (this.latestChatService.selectedChat()?.chat?.id === message.chatRoom.id) {
				return;
			}

			this.pushMessage(message);
		});
	}

	pushMessage(message: ChatPushMessage){
		this.messageService.add({ key: 'chat-message', sticky: true, severity: 'success', summary: this.chatMessageHelper.getMessageText(message.message), data: message })
	}

	onReply(message: ChatPushMessage) {
		this.flyoutService.openById(message.chatRoom.id);
		this.messageService.clear('chat-message');
	}

	getChatInfo(message: ChatPushMessage): UserChatInfoDto {
		return { chat: message.chatRoom } as UserChatInfoDto;
	}
}
