import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ChatMemberService, ChatMemberType, UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatMessageDto } from '@eleon/collaboration-proxy';
import { ChatInteractionService } from '@eleon/collaboration-proxy';
import { Observable, Subscription, finalize, of } from "rxjs";
import { ChatMessageHelperService } from "../chat-services/chat-message-helper.service";
import { ChatMessageType, ChatRoomType } from '@eleon/collaboration-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { ChatCache } from "../chat-services/chat-cache";
import { NebularMessage } from "../chat-types";
import { NbChatComponent, NbChatFormComponent } from "@nebular/theme";
import { ChatDocumentUploaderComponent } from "./chat-document-uploader/chat-document-uploader.component";
import { ChatTextHelperService } from "../chat-services/chat-text-helper.service";
import { LatestChatsService } from "../chat-services/latest-chats.service";
import { ChatRoomStatus } from '@eleon/collaboration-proxy';
import { ChatScreenshotUploaderComponent } from "./chat-screenshot-uploader/chat-screenshot-uploader.component";
import { ChatHubService } from "../chat-services/chat-hub.service";
import { Output, EventEmitter } from "@angular/core";
import { Router } from '@angular/router'

@Component({
  standalone: false,
  selector: "app-chat-box",
  templateUrl: "./chat-box.component.html",
  styleUrls: ["./chat-box.component.scss"],
})
export class ChatBoxComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NbChatFormComponent)
  private chatFormComponent: NbChatFormComponent;

  @ViewChild(NbChatComponent)
  private chatComponent: NbChatComponent;

  private cache: ChatCache;
  private pageSize = 30;
  private messageSub: Subscription;

	@Output()
  chatChange = new EventEmitter<UserChatInfoDto>();

  private get scrollElement(): HTMLElement {
    return this.chatComponent.scrollable.nativeElement;
  }

  private get scrollAtBottom(): boolean {
    const scrollHeight = this.scrollElement.scrollHeight;
    const scrollTop = this.scrollElement.scrollTop;
    const clientHeight = this.scrollElement.clientHeight;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 2.0;
    return isAtBottom;
  }

  private get scroll(): number {
    return this.scrollElement.scrollTop;
  }

  private set scroll(val: number) {
    this.scrollElement.scrollTop = val;
  }

  public scrollBottom = true;
  public loading = false;

  public get placeholder(): string {
    const msg = this.loading
      ? "Infrastructure::Loading" + "..."
      : "Collaboration::NoMessages";
    return this.localizationService.instant(msg);
  }

  public get showSendForm(): boolean {
    return this.chat.chat.status !== ChatRoomStatus.Closed && this.isUserMember;
  }

  public messages$: Observable<NebularMessage[]> = null;

  public get isUserMember(): boolean {
    return this.chat.memberType !== ChatMemberType.Undefined;
  }

  public get canUserJoin(): boolean {
    return this.chat.chat.isPublic && !this.isUserMember;
  }

  @Input()
  public chat: UserChatInfoDto;

  @Input()
  public height: string = "95%";

  constructor(
    private chatService: ChatInteractionService,
    private chatMemberService: ChatMemberService,
    private router: Router,
    private messageHelper: ChatMessageHelperService,
    private messageTextHelper: ChatTextHelperService,
    private chatHubService: ChatHubService,
    private localizationService: ILocalizationService,
    //private contentProjectionService: ContentProjectionService,
    private renderer: Renderer2,
    private latestChatsService: LatestChatsService,
    private viewRef: ViewContainerRef
  ) {}

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
  }

  public ngOnInit(): void {
    this.cache = new ChatCache(this.messageHelper, this.messageTextHelper);
    this.messages$ = this.cache.messages$;
    this.listenPushes();
    this.loadChat();
  }

  public ngAfterViewInit(): void {
    this.listenScroll();

    if (this.showSendForm) {
      this.injectScreenshotUploader();
      this.injectDocumentUploader();
    }
  }

  public async sendMessage(msg: any): Promise<void> {
    const mappedMsgs =
      await this.messageHelper.createTempVportalMessagesFromNebular(
        msg,
        this.chat.chat,
        this.chat.userRole
      );

    for (const msg of mappedMsgs) {
      this.cache.addTempOutcomingMessage(msg.msg);
      msg.request.subscribe((message) => {
        this.cache.addPermanentOutcomingMessage(message, msg.msg.id);
      });
    }
  }

  private listenScroll(): void {
    this.renderer.listen(
      this.chatComponent.scrollable.nativeElement,
      "scroll",
      () => {
        this.ackScroll();
      }
    );
  }

  private injectDocumentUploader(): void {
    const element = this.viewRef.element.nativeElement.querySelector(
      "nb-chat-form .send-button"
    ) as HTMLElement;

    // Dynamically create the component and insert it before the send button
    const componentRef = this.viewRef.createComponent(ChatDocumentUploaderComponent);

    // Insert the component's host element before the send button
    element.parentNode.insertBefore(componentRef.location.nativeElement, element);

    // Pass required references to the component instance
    // const componentRef = this.contentProjectionService.projectContent(
    //   new RootComponentProjectionStrategy(
    //     ChatDocumentUploaderComponent,
    //     CONTEXT_STRATEGY.None(),
    //     DOM_STRATEGY.BeforeElement(element)
    //   )
    // );

    componentRef.instance.chatForm = this.chatFormComponent;
  }

  private injectScreenshotUploader(): void {
    // if (this.chat.chat.type !== ChatRoomType.SupportTicket) {
    //   return;
    // }

    const element = this.viewRef.element.nativeElement.querySelector(
      "nb-chat-form .send-button"
    ) as HTMLElement;

    const componentRef = this.viewRef.createComponent(ChatScreenshotUploaderComponent);
    element.parentNode.insertBefore(componentRef.location.nativeElement, element);

    // const componentRef = this.contentProjectionService.projectContent(
    //   new RootComponentProjectionStrategy(
    //     ChatScreenshotUploaderComponent,
    //     CONTEXT_STRATEGY.None(),
    //     DOM_STRATEGY.BeforeElement(element)
    //   )
    // );

    componentRef.instance.chatForm = this.chatFormComponent;
    componentRef.instance.chat = this.chat;
    componentRef.instance.loadingChange.subscribe((loading) => {
      this.loading = loading;
    });
  }

  private ackScroll(): void {
    this.scrollBottom = this.scrollAtBottom;

    const isAtTop = this.scroll === 0;
    const isAtChatStart =
      this.cache.messages?.[0]?.data?.msg?.type === ChatMessageType.ChatCreated;
    const loadNeeded = isAtTop && !isAtChatStart && !this.loading;
    if (loadNeeded) {
      this.loadMore();
    }
  }

  private loadMore(): void {
    this.loading = true;
    this.chatService
      .getChatMessagesByChatIdAndSkipAndTake(
        this.chat.chat.id,
        this.cache.messagesCount,
        this.pageSize
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((messages) => {
        this.cache.addMessages(messages);
      });
  }

  private loadChat(): void {
    this.loading = true;
    this.chatService
      .openChatByChatIdAndLimit(this.chat.chat.id, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((messages) => {
        this.latestChatsService.markAsRead(this.chat.chat.id);
        this.cache.addMessages(messages);
      });
  }

  private listenPushes(): void {
    this.messageSub = this.chatHubService.messageReceived$.subscribe((msg) => {
      const isForThisChat = msg.chatRoom.id === this.chat.chat.id;
      if (!isForThisChat) {
        return;
      }

      this.cache.pushMessage(msg.message);

      if (!this.messageHelper.isOutcoming(msg.message)) {
        this.latestChatsService.markAsRead(this.chat.chat.id);
        this.chatService
          .ackMessageReceivedByMessageId(msg.message.id)
          .subscribe(_ => {}, (error) => {
						//this.chatChange.emit(null);
					});
      }
    });
  }

  public joinChat(){
    if (!this.canUserJoin) {
      return;
    }

    this.loading = true;
    this.chatMemberService
      .joinChatByChatId(this.chat.chat.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((chat) => {
        this.chat.userRole = this.chat.chat.defaultRole;
        this.chat.memberType = ChatMemberType.User;
				//this.chatChange.emit(null);
        this.latestChatsService.refresh();
      });
  }
}
