import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DocumentConversationService } from '@eleon/collaboration-proxy';
import {
  ChatMemberRole,
  ChatMemberType,
  ChatRoomStatus,
} from '@eleon/collaboration-proxy';
import { finalize } from "rxjs";
import { ChatWidgetFlyoutService } from "../../chat-widget/chat-widget-flyout.service";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { DocumentConversationInfoDto } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: "app-document-conversation-button",
  templateUrl: "./document-conversation-button.component.html",
  styleUrls: ["./document-conversation-button.component.scss"],
})
export class DocumentConversationButtonComponent implements OnChanges {
  public conversation: DocumentConversationInfoDto;
  loading: boolean = false;

  @Input()
  documentId: string;

  @Input()
  documentObjectType: string;

  @Input()
  showOnlyIcon: boolean = false;

  constructor(
    private documentConversationService: DocumentConversationService,
    private chatWidgetFlyoutService: ChatWidgetFlyoutService,
    private localizationService: ILocalizationService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["documentId"] || changes["documentObjectType"]) {
      this.init();
    }
  }

  public openConversation(): void {
    const chatInfo: UserChatInfoDto = {
      unreadCount: 0,
      chat: {
        ...this.conversation.chatRoom,
        name: this.localizationService.instant(
          "Conversation::DocumentConversation"
        ),
      },
      lastChatMessage: null,
      isChatMuted: false,
			isArchived: false,
      userRole: ChatMemberRole.Regular,
      memberType: ChatMemberType.User,
      memberRef: null,
      allowedOrganizationUnits: [],
      allowedRoles: [],
    };

    this.chatWidgetFlyoutService.open(chatInfo, false);
  }

  private init(): void {
    if (!this.documentId || !this.documentObjectType) {
      this.conversation = null;
      return;
    }

    this.loading = true;
    this.documentConversationService
      .getDocumentConversationInfoByDocTypeAndDocumentId(
        this.documentObjectType,
        this.documentId
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((c) => {
        this.conversation = c;
      });
  }
}
