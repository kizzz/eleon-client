import {
  computed,
  EventEmitter,
  Injectable,
  Input,
  Output,
  signal,
} from '@angular/core';
import { LatestChat } from '../chat-types';
import {
  ChatInteractionService,
  UserChatInfoDto,
} from '@eleon/collaboration-proxy';
import {
  BehaviorSubject,
  Observable,
  finalize,
  firstValueFrom,
  from,
  tap,
} from 'rxjs';
import { ChatMessageType, ChatRoomType } from '@eleon/collaboration-proxy';
import { ChatHubService, ChatPushMessage } from './chat-hub.service';
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';

const messageTypesRequiringRefresh = [
  ChatMessageType.ChatRenamed,
  ChatMessageType.ChatCreated,
  ChatMessageType.UserLeft,
  ChatMessageType.MembersAdded,
  ChatMessageType.MembersKicked,
];

export interface LoadingParams {
  searchQuery?: string;
  isArchived?: boolean;
  chatRoomTypes?: ChatRoomType[];
  isChannels?: boolean;
  tags?: string[];
}

export class LatestChatsManager {
  private lastLoadingParams: LoadingParams = {
    searchQuery: null,
    isArchived: false,
    chatRoomTypes: [ChatRoomType.Private, ChatRoomType.Group],
    tags: [],
    isChannels: false,
  };

  private readonly _chats = signal<LatestChat[]>([]);
  public readonly chats = computed(() => this._chats());

  private readonly _selectedChat = signal<UserChatInfoDto>(null);
  public readonly selectedChat = computed(() => this._selectedChat());

  public readonly configSg = signal<LoadingParams>(this.lastLoadingParams);

  public readonly currentTab = signal(0);

  private readonly _unreadCount = signal<number>(0);
  public readonly unreadCount = computed(() => this._unreadCount());

  private readonly _loadingChats = signal(false);
  public readonly loadingChats = computed(() => this._loadingChats());

  public getCurrentTab() {
    if (this.lastLoadingParams.isArchived) {
      return 2;
    }

    if (this.lastLoadingParams.isChannels) {
      return 1;
    }

    return 0;
  }

  private readonly _chatsObj = new BehaviorSubject<LatestChat[]>([]);
  public chats$: Observable<LatestChat[]> = this._chatsObj.asObservable();

  private pageSize: number = 25;
  private pushSubscription: any;

  constructor(
    private chatService: ChatInteractionService,
    private chatHubService: ChatHubService,
    private config: IApplicationConfigurationManager,
    defaultLoadingParams: LoadingParams = null
  ) {
    this.listenPushes();
    this.lastLoadingParams = {
      ...this.lastLoadingParams,
      ...defaultLoadingParams,
    };
  }

  private notifyReadChange() {
    const count = this._chats().reduce(
      (sum, chat) => sum + chat.data.unreadCount,
      0
    );
    this._unreadCount.set(count);
  }

  public async refresh(params: LoadingParams = null): Promise<void> {
    if (params) {
      // deprecated use cfgSg
      this.lastLoadingParams = { ...this.lastLoadingParams, ...params };
      this.currentTab.set(this.getCurrentTab());
    }

    this._loadingChats.set(true);
    this._chats.set([]);
    this._chatsObj.next([]);
    const paged = await firstValueFrom(
      this.chatService
        .getLastChatsByRequest({
          skip: 0,
          take: this.pageSize,
          nameFilter: this.lastLoadingParams.searchQuery,
          chatRoomTypes: this.lastLoadingParams.chatRoomTypes,
          isArchived: this.lastLoadingParams.isArchived,
          isChannel: this.lastLoadingParams.isChannels,
          tags: this.lastLoadingParams.tags,
        })
        .pipe(finalize(() => this._loadingChats.set(false)))
    );

    const chats = paged.items.map((item) => ({ data: item }));
    this._chats.set(chats);
    this._chatsObj.next(chats);
    this.notifyReadChange();
  }

  public markAsRead(chatId: string): void {
    this._chats.update((ch) => {
      const present = this._chats().find((x) => x.data.chat.id === chatId);
      if (present) {
        present.data.unreadCount = 0;
      }
      return ch.map((x) => (x.data.chat.id === chatId ? present : x));
    });
    this.notifyReadChange();
  }

  public loadMore(): void {
    this._loadingChats.set(true);
    this.chatService
      .getLastChatsByRequest({
        skip: this._chats().length,
        take: this.pageSize,
        nameFilter: this.lastLoadingParams.searchQuery,
        chatRoomTypes: this.lastLoadingParams.chatRoomTypes,
        isArchived: this.lastLoadingParams.isArchived,
        isChannel: this.lastLoadingParams.isChannels,
        tags: this.lastLoadingParams.tags,
      })
      .subscribe((paged) => {
        const loaded = paged.items.map((item) => ({ data: item }));
        this._chats.update((before) => this.updateChatList(before, loaded));
        this.notifyReadChange();
      },
      (err) => {},
      () => {
        this._loadingChats.set(false);
      }
    );
  }

  public loadChatById(chatId: string): Observable<UserChatInfoDto> {
    if (!chatId) {
      return from([null]);
    }

    const chat = this._chats().find((x) => x.data.chat.id === chatId);
    if (chat) {
      return from([chat.data]);
    }

    return this.chatService.getChatById(chatId).pipe(
      tap((x) => {
        if (x) {
          this._chats.update((before) =>
            this.updateChatList(before, [{ data: x }])
          );
        }
      })
    );
  }

  public setSelectedChat(chat: UserChatInfoDto) {
    this._selectedChat.set(chat);
  }

  private listenPushes(): void {
    if (this.pushSubscription) return;
    this.pushSubscription = this.chatHubService.messageReceived$.subscribe(
      (msg) => {
        const localChatRoom = this._chats().find(
          (x) => x.data.chat.id === msg.chatRoom.id
        );

        const requiresRefresh =
          messageTypesRequiringRefresh.includes(msg.message.type) ||
          !localChatRoom;

        if (requiresRefresh) {
          this.refresh();
        } else {
          this.insertMessageInExistingChat(msg, localChatRoom);
        }
      }
    );
  }

  private insertMessageInExistingChat(
    msg: ChatPushMessage,
    chat: LatestChat
  ): void {
    chat.data.lastChatMessage = msg.message;
    const currentUser = this.config.getAppConfig().currentUser;
    if (msg.message.unread && msg.message.senderInfo.id !== currentUser.id) {
      chat.data.unreadCount++;
    }

    this._chats.update((before) => [chat, ...before.filter((x) => x !== chat)]);
    this.notifyReadChange();
  }

  private updateChatList(
    before: LatestChat[],
    added: LatestChat[]
  ): LatestChat[] {
    const uniqueChats = new Map<string, LatestChat>();
    before.forEach((chat) => {
      uniqueChats.set(chat.data.chat.id, chat);
    });
    added.forEach((chat) => {
      uniqueChats.set(chat.data.chat.id, chat);
    });
    return Array.from(uniqueChats.values()).sort((a, b) => {
      const aTime = a.data.lastChatMessage?.creationTime
        ? new Date(a.data.lastChatMessage.creationTime).getTime()
        : 0;
      const bTime = b.data.lastChatMessage?.creationTime
        ? new Date(b.data.lastChatMessage.creationTime).getTime()
        : 0;
      return bTime - aTime;
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class LatestChatsService extends LatestChatsManager {
  constructor(
    chatService: ChatInteractionService,
    chatHubService: ChatHubService,
    config: IApplicationConfigurationManager
  ) {
    super(chatService, chatHubService, config, {
      chatRoomTypes: [ChatRoomType.Private, ChatRoomType.Group],
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class LatestSupportTicketsService extends LatestChatsManager {
  constructor(
    chatService: ChatInteractionService,
    chatHubService: ChatHubService,
    config: IApplicationConfigurationManager
  ) {
    super(chatService, chatHubService, config, {
      chatRoomTypes: [ChatRoomType.SupportTicket],
    });
  }
}
