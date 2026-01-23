import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatMemberInfo } from '@eleon/collaboration-proxy';
import { ChatMemberService } from '@eleon/collaboration-proxy';
import { CommonUserDto } from '@eleon/angular-sdk.lib';
import { ChatMemberRole, ChatRoomType } from '@eleon/collaboration-proxy';
import { finalize } from "rxjs";
import { LatestChatsService } from "../chat-services/latest-chats.service";
import { ConfirmationService } from "primeng/api";

@Component({
  standalone: false,
  selector: "app-chat-members-management-modal",
  templateUrl: "./chat-members-management-modal.component.html",
  styleUrls: ["./chat-members-management-modal.component.scss"],
})
export class ChatMembersManagementModalComponent implements OnChanges {
  public members: ChatMemberInfo[];
  public loading: boolean = false;
  public showAddUserModal = false;
  public selectedUsersToAdd: CommonUserDto[];

  public get preselectedUsers(): string[] {
    return this.members.map((m) => m.id);
  }

  public get allowEdit(): boolean {
    return (
      this.chat.userRole === ChatMemberRole.Administrator ||
      this.chat.userRole === ChatMemberRole.Owner
    );
  }

  public get showMainDialog(): boolean {
    return this.showDialog && !this.showAddUserModal;
  }

  @Input()
  showDialog: boolean = false;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  @Input()
  chat: UserChatInfoDto;

  constructor(
    private confirmationService: ConfirmationService,
    private localizationService: ILocalizationService,
    private latestChatsService: LatestChatsService,
    private chatMemberService: ChatMemberService,
    private stateService: IApplicationConfigurationManager
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["chat"] || changes["showDialog"]?.currentValue) {
      //this.loadMembers();
      this.members = this.chat?.chat.chatMembersPreview || [];
    }
  }

  private loadMembers(): void {
    const userId = this.stateService.getAppConfig().currentUser?.id;
    this.loading = true;
    this.chatMemberService
      .getChatMembersByChatId(this.chat.chat.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((members) => {
        this.members = members.filter((m) => m.id !== userId);
      });
  }

  public kickUser(user: string): void {

    this.confirmationService.confirm({
      message: this.localizationService.instant("Collaboration::KickUser:Confirm"),
      accept: () => {
        this.chatMemberService
          .kickChatMembersByRequest({
            chatId: this.chat.chat.id,
            userIds: [user],
          })
          .subscribe(() => {
            this.latestChatsService.refresh();
            this.members = this.members.filter((m) => m.id !== user);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::Cancel"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
  }

  public onAddUserRequested(): void {
    this.selectedUsersToAdd = [];
    this.showAddUserModal = true;
  }

  public addUsers(): void {
    const ids = this.selectedUsersToAdd.map((u) => u.id);
    if (!ids.length) {
      this.showAddUserModal = false;
    }

    this.loading = true;
    this.chatMemberService
      .addChatMembersByRequest({
        chatId: this.chat.chat.id,
        userIds: this.selectedUsersToAdd.map((u) => u.id),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.showAddUserModal = false;
        this.latestChatsService.refresh();
        this.loadMembers();
      });
  }

  public onMainDialogClosed(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
  }

  public get isSupportTicket(): boolean {
    return this.chat?.chat?.type === ChatRoomType.SupportTicket;
  }
}
