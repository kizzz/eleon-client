import { CommonOrganizationUnitDto, CommonRoleDto, CommonUserDto } from '@eleon/angular-sdk.lib';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { ChatMemberInfo, ChatMemberService } from '@eleon/collaboration-proxy';
import { ChatRoomService } from '@eleon/collaboration-proxy';
import { ChatMemberRole } from '@eleon/collaboration-proxy';
import { ConfirmationService, MessageService } from "primeng/api";
import { finalize } from "rxjs";
import { LocalizedMessageService } from '@eleon/primeng-ui.lib'
import { LatestChatsService } from '../chat-services/latest-chats.service'
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChangeDetectorRef } from '@angular/core';
import { RequiredMarkDirective } from '@eleon/angular-sdk.lib';

import { ILocalizationService } from '@eleon/angular-sdk.lib';
@Component({
  standalone: false,
  selector: "app-group-chat-create-modal",
  templateUrl: "./group-chat-create-modal.component.html",
  styleUrls: ["./group-chat-create-modal.component.scss"],
})
export class GroupChatCreateModalComponent implements OnChanges {
  members: ChatMemberInfo[] = [];
  loading: boolean = false;
  selectedUsersToAdd: CommonUserDto[] = [];
  selectedRoles: CommonRoleDto[] = [];
  selectedUnits: CommonOrganizationUnitDto[] = [];

  chatName: string;
  nameInvalid: boolean = false;
  tags: string[] = [];
  activeIndex = 0;

  @Input()
  chat?: UserChatInfoDto = null;

  get isUpdate(): boolean {
    return this.chat?.chat?.id != null;
  }

  public showAddUserModal = false;
  public showUnitsDialog: boolean = false;
  public showRolesDialog: boolean = false;

  public get preselectedUsers(): string[] {
    return this.members.map((m) => m.id);
  }

  public title: string = '';

  public get showMainDialog(): boolean {
    return this.showDialog && !this.showAddUserModal && !this.showRolesDialog && !this.showUnitsDialog;
  }

  selectedDefaultChatRole: ChatMemberRole = ChatMemberRole.Regular;
  defaultChatRoleOptions = []

  @Input()
  isPublic: boolean = false;

  @Input()
  showDialog: boolean = false;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  constructor(
    private chatService: ChatRoomService,
    private localizationService: ILocalizationService,
		private messageService: LocalizedMessageService,
    private latestChatsService: LatestChatsService,
    private cdr: ChangeDetectorRef,
    private chatMemberService: ChatMemberService,
    private confirmationService: ConfirmationService,

  ) {
    this.defaultChatRoleOptions = [
      { name: this.localizationService.instant("Collaboration::ChatMemberRole:Regular"), value: ChatMemberRole.Regular },
      { name: this.localizationService.instant("Collaboration::ChatMemberRole:Administrator"), value: ChatMemberRole.Administrator },
    ];

    this.title = this.localizationService.instant("Collaboration::CreateChat:Title");
  }

  ngOnChanges(changes: SimpleChanges): void {   
    this.init(changes);
  }

  onAddUserRequested(): void {
    this.selectedUsersToAdd = [];
    this.showAddUserModal = true;
  }

  removeUser(userId: string): void {
    if (this.isUpdate){
      this.confirmationService.confirm({
        message: this.localizationService.instant("Collaboration::KickUser:Confirm"),
        accept: () => {
          this.chatMemberService
            .kickChatMembersByRequest({
              chatId: this.chat.chat.id,
              userIds: [userId],
            })
            .subscribe(() => {
              this.latestChatsService.refresh();
              this.members = this.members.filter((m) => m.id !== userId);
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
    this.members = this.members.filter((x) => x.id !== userId);
  }

  addUsers(): void {
    if (this.isUpdate){
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
        });
    }
    const newMembers = this.selectedUsersToAdd.map((x) => ({
      id: x.id,
      name: x.name,
      avatar: null,
      role: this.selectedDefaultChatRole || ChatMemberRole.Regular,
    }));

    this.members = [...this.members, ...newMembers];
    this.selectedUsersToAdd = [];
    this.showAddUserModal = false;
  }

  onMainDialogClosed(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
    this.nameInvalid = false;
    this.init();
  }

  onCreatePressed(): void {
		if (!this.validate()) {
			return;
		}

    this.loading = true;

    this.chatService
      .createChat({
        chatName: this.chatName,
        initialMembers: Object.fromEntries(this.members.map((m) => [m.id, m.role])),
        setOwner:  true,
        isPublic: this.isPublic,
        allowedOrgUnits: this.selectedUnits?.map(x => x.id) ?? [],
        allowedRoles: this.selectedRoles?.map(x => x.id) ?? [],
        tags: this.tags,
        defaultRole: this.selectedDefaultChatRole,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
					this.messageService.success("Collaboration::CreateGroupChat:CreateSuccess");
          this.latestChatsService.refresh();
          this.showDialog = false;
          this.nameInvalid = false;
          this.showDialogChange.emit(false);
        },
        error: () => {
					this.messageService.error("Collaboration::CreateGroupChat:CreateFail");
        },
      });
  }

  updateChat(){
    if (!this.validate()) {
			return;
		}

    this.loading = true;

    this.chatService
    .update({
      chatId: this.chat.chat.id,
      chatName: this.chatName,
      isPublic: this.isPublic,
      tags: this.tags,
      defaultRole: this.selectedDefaultChatRole,
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: () => {
        this.messageService.success("Collaboration::CreateGroupChat:UpdateSuccess");
        this.latestChatsService.refresh();
      },
      error: () => {
        this.messageService.error("Collaboration::CreateGroupChat:UpdateFail");
      },
    });
  }

  validate() : boolean {
    if (!this.chatName?.length) {
			this.messageService.error("Collaboration::CreateGroupChat:NameRequired");
      this.nameInvalid = true;
			return false;
		}
		
		if (!this.members?.length && !this.isPublic) {
			this.messageService.error("Collaboration::CreateGroupChat:NoMembers");
			return false;
		}

    return true;
  }

  onPublicChatChanged(){
    if (this.isUpdate){
      this.updateChat();
    }
  }

  tagInput = '';
  addTag(){
    this.tagInput = this.tagInput.trim();
    if (!this.tagInput) {
      this.messageService.error("Collaboration::CreateChat:TagEmpty");
      return;
    }

    if (this.tags.includes(this.tagInput)) {
      this.messageService.error("Collaboration::CreateChat:TagAlreadyExists");
      return;
    }
    this.tags.push(this.tagInput);
    this.tagInput = '';
    this.cdr.detectChanges();

    if (this.isUpdate){
      this.updateChat();
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);

    if (this.isUpdate){
      this.updateChat();
    }
  }

  saveName(){
    this.updateChat();
  }

  defaultRoleChanged(){
    if (this.isUpdate){
      this.updateChat();
    }
  }

  get allowEditUsers(): boolean {
    return !this.chat || this.chat?.userRole == ChatMemberRole.Owner || this.chat?.userRole == ChatMemberRole.Administrator;
  }

  get allowEditRoleAndUnits(): boolean {
    return !this.chat;
  }

  private init(changes: SimpleChanges = null){
    this.activeIndex = 0;
    if (this.chat){
      this.tags = this.chat?.chat?.tags ?? [];
      this.chatName = this.chat?.chat?.name ?? '';
      this.isPublic = this.chat?.chat?.isPublic ?? false;
      this.members = this.chat?.chat?.chatMembersPreview.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: '',
        role: m.role,
      })) ?? [];
      this.selectedDefaultChatRole = this.chat?.chat?.defaultRole ?? ChatMemberRole.Regular;
      this.selectedRoles = this.chat?.allowedRoles?.map(x => ({ name: x } as CommonRoleDto)) ?? [];
      this.selectedUnits = this.chat?.allowedOrganizationUnits?.map(x => ({ id: x.id, displayName: x.displayName } as CommonOrganizationUnitDto)) ?? [];

      this.tagInput = '';
      this.title = this.localizationService.instant("Collaboration::ChatSettings:Title");
    }
    else {
      this.tags = [];
      this.tagInput = '';
      this.chatName = '';
      this.isPublic = false;
      this.members = [];
      this.selectedDefaultChatRole = ChatMemberRole.Regular;
      this.selectedRoles = [];
      this.selectedUnits = [];
      this.title = this.localizationService.instant("Collaboration::CreateChat:Title");
    }
  }
}
