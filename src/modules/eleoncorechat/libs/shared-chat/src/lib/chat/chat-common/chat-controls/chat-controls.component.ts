
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import {
  ChatMemberService,
  SupportTicketService,
  UserChatSettingService,
} from '@eleon/collaboration-proxy';
import {
  ChatMemberRole,
  ChatRoomType,
} from '@eleon/collaboration-proxy';
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { LatestChatsService } from "../chat-services/latest-chats.service";
import { ChatRoomStatus } from '@eleon/collaboration-proxy';
import { finalize } from "rxjs";
import { LocalizedMessageService } from '@eleon/primeng-ui.lib'
import { ChatWidgetFlyoutService } from '../../chat-widget'
import { Router } from '@angular/router'
import { ChatMemberType } from '@eleon/collaboration-proxy';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: false,
  selector: "app-chat-controls",
  templateUrl: "./chat-controls.component.html",
  styleUrls: ["./chat-controls.component.scss"],
})
export class ChatControlsComponent implements OnInit {
  showCreateGroupChatModal: boolean = false;
  showManagementModal: boolean = false;

  public loadingPin: boolean = false;
  public loadingLeave: boolean = false;
  public loadingMute: boolean = false;
	public loadingArchive: boolean = false;
  public loadingCloseTicket: boolean = false;

  public get loading(): boolean {
    return (
      this.loadingCloseTicket ||
      this.loadingLeave ||
      this.loadingMute ||
      this.loadingPin ||
      this.loadingArchive
    );
  }

  public get showUserManagement(): boolean {
    return !this.compactView;
  }

  public get showSettings(): boolean {
    return (
      this.chat.userRole === ChatMemberRole.Owner ||
      this.chat.userRole === ChatMemberRole.Administrator
    );
  }

  public get showMute(): boolean {
    return !this.showPin && !this.chat.isChatMuted && this.chat.memberType !== ChatMemberType.Undefined;
  }

  public get showUnmute(): boolean {
    return !this.showPin && this.chat.isChatMuted && this.chat.memberType !== ChatMemberType.Undefined;
  }

  public get showLeave(): boolean {
    return (
      !this.showPin &&
      this.chat.chat.type !== ChatRoomType.SupportTicket &&
      this.isMember && this.chat.memberType !== ChatMemberType.Undefined
    );
  }

  public get showPin(): boolean {
    // return (
    //   this.chat.chat.type === ChatRoomType.DocumentConversation &&
    //   !this.isMember
    // );
		return false;
  }

  public get showCloseTicket(): boolean {
    return (
      this.chat.chat.type === ChatRoomType.SupportTicket &&
      this.chat.chat.status !== ChatRoomStatus.Closed &&
      this.showSettings
    );
  }

  public get isSupportTicket(): boolean {
    return (
      this.chat.chat.type === ChatRoomType.SupportTicket
    );
  }

	public get showArchive(){
		return !this.chat.isArchived && this.chat.memberType !== ChatMemberType.Undefined;
	}

	public get showUnarchive(){
		return this.chat.isArchived && this.chat.memberType !== ChatMemberType.Undefined;
	}

  public get showBack(): boolean {
    return !this.compactView && this.sideBarView;
  }
  
  public get showNavigateToFullPage(): boolean {
    return !this.compactView && this.sideBarView;
  }

  public get showCloseChatView(){
    return !this.compactView && this.sideBarView;
  }

  public get showHiddenMenu(){
    return !this.compactView;
  }

  @Input()
  chat: UserChatInfoDto;

  @Input()
  compactView = false;

  @Input()
  isMember = true;

  @Input()
  sideBarView = true;

  @Output()
  isMemberChange = new EventEmitter<boolean>();

  @Output()
  onChatLeft = new EventEmitter<void>();

  @Output()
  onBackClicked = new EventEmitter<void>();

  constructor(
    private localizationService: ILocalizationService,
    private msgService: LocalizedMessageService,
    private confirmationService: ConfirmationService,
    private memberService: ChatMemberService,
    private latestChatService: LatestChatsService,
    private chatSettingService: UserChatSettingService,
    private supportTicketService: SupportTicketService,
    private flyoutService: ChatWidgetFlyoutService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {

  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] || changes['sideBarView']){
      this.menuItems = this.configureMenuItems();
    }
  }

  menuItems: MenuItem[] = [];
  // get menuItems(): MenuItem[]{
  //   return this.configureMenuItems();
  // }

  configureMenuItems = () =>{
    const menuItems = [];

    if (this.showMute){
      menuItems.push({
        label: this.localizationService.instant("Collaboration::MuteChat"),
        icon: "fa fa-volume-up",
        command: () => this.muteChat(),
      });
    }

    if (this.showUnmute) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::UnmuteChat"),
        icon: "fa fa-volume-off",
        command: () => this.unmuteChat(),
      });
    }

    if (this.showCloseTicket) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::CloseTicket"),
        icon: "fa fa-ticket",
        command: () => this.closeTicket(),
      });
    }

    if (this.showArchive) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::ArchiveChat"),
        icon: "fa fa-archive",
        command: () => this.archiveChat(),
      });
    }

    if (this.showUnarchive) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::UnarchiveChat"),
        icon: "fa fa-boxes-packing",
        command: () => this.unarchiveChat(),
      });
    }

    if (this.showPin) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::PinChat"),
        icon: "fa fa-thumb-tack",
        command: () => this.pinChat(),
      });
    }

    if (this.showSettings) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::Settings"),
        icon: "fa fa-cog",
        command: () => this.openSettings(),
      });

      menuItems.push({
        label: this.localizationService.instant("Collaboration::UserManagement"),
        icon: "fa fa-users",
        command: () => this.openUserManagement(),
      });
    }

    if (this.showNavigateToFullPage) {
      menuItems.push({
        label: this.localizationService.instant("Collaboration::NavigateToFullPage"),
        icon: "fa fa-external-link-alt",
        command: () => this.navigateToFullPage(),
      });
    }

    if (this.showLeave){
      menuItems.push({
        label: this.localizationService.instant("Collaboration::LeaveChat"),
        icon: "fa fa-arrow-left",
        command: () => this.leaveChat(),
      });
    }

    return menuItems;
  }

  public openUserManagement(): void {
    this.showManagementModal = true;
  }

  public muteChat(): void {
    this.setMute(true);
  }

  public unmuteChat(): void {
    this.setMute(false);
  }

  public async leaveChat(): Promise<void> {
    let closeGroup = false;

    const doLeave = await this.confirmAsync( "Collaboration::LeaveChat:Confirm");
    if (!doLeave) {
      return;
    }

    if (this.chat.userRole === ChatMemberRole.Owner) {
      closeGroup = await this.confirmAsync("Collaboration::LeaveChat:CloseGroupAfterLeave");
    }

    this.loadingLeave = true;
    this.memberService
      .leaveChatByChatIdAndCloseGroup(this.chat.chat.id, closeGroup)
      .pipe(finalize(() => (this.loadingLeave = false)))
      .subscribe((success) => {
        if (success) {
          this.msgService.success("Collaboration::LeaveChat:Success");
          this.latestChatService.refresh();
          this.onChatLeft.emit();
        } else {
          this.msgService.error("Collaboration::LeaveChat:Error");
        }
      });
  }

  public async closeTicket(): Promise<void> {
    const doClose = await this.confirmAsync("Collaboration::CloseTicket:Confirm");
    if (!doClose) {
      return;
    }

    this.loadingCloseTicket = true;
    this.supportTicketService
      .closeSupportTicketByTicketChatRoomId(this.chat.chat.id)
      .pipe(finalize(() => (this.loadingCloseTicket = false)))
      .subscribe((success) => {
        if (success) {
          this.msgService.success("Collaboration::CloseTicket:Success");
          this.latestChatService.refresh();
          this.onChatLeft.emit();
        } else {
          this.msgService.error("Collaboration::CloseTicket:Fail");
        }
      });
  }

  public pinChat(): void {
    this.loadingPin = true;
    this.memberService
      .joinChatByChatId(this.chat.chat.id)
      .pipe(finalize(() => (this.loadingPin = false)))
      .subscribe((success) => {
        if (success) {
          this.isMember = true;
          this.isMemberChange.emit(true);
        }
      });
  }

  private setMute(mute: boolean): void {
    this.loadingMute = true;
    this.chatSettingService
      .setChatMuteByChatIdAndIsMuted(this.chat.chat.id, mute)
      .pipe(finalize(() => (this.loadingMute = false)))
      .subscribe((success) => {
        this.chat.isChatMuted = mute;
        let msg = !mute ? this.localizationService.instant("Collaboration::UnmuteChat:Success") : this.localizationService.instant("Collaboration::MuteChat:Success")
        this.msgService.success(msg);
        this.menuItems = this.configureMenuItems();
        this.cdr.detectChanges();
      });
  }

  confirmAsync(msg: string): Promise<boolean> {
    return new Promise((res, rej) => {
      this.confirmationService.confirm({
        message: this.localizationService.instant(msg), 
        accept: () => res(true),
        reject: () => res(false),
        acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
        rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    });
    });
  }

	archiveChat(){
		this.loadingArchive = true;
		this.chatSettingService
			.setChatArchived(this.chat.chat.id, true)
			.pipe(finalize(() => (this.loadingArchive = false)))
			.subscribe((success) => {
				this.chat.isArchived = true;
				this.msgService.success("Collaboration::ArchiveChat:Success");
				this.latestChatService.refresh();
			});
	}

	unarchiveChat(){
		this.loadingArchive = true;
		this.chatSettingService
			.setChatArchived(this.chat.chat.id, false)
			.pipe(finalize(() => (this.loadingArchive = false)))
			.subscribe((success) => {
				this.chat.isArchived = false;
				this.msgService.success("Collaboration::UnarchiveChat:Success");
				this.latestChatService.refresh();
			});
	}

  onBack(){
    this.onBackClicked.emit();
    this.flyoutService.selected$.next(null);
  }

  closeChatView(){
    this.flyoutService.close();
  }

  navigateToFullPage(){
    this.flyoutService.close();
    this.router.navigate(["/collaboration/chats"], {
      queryParams: { chat: this.chat.chat.id },
    });
  }

  showSettingsDialog = false;
  public openSettings(){
    this.showSettingsDialog = true;
  }
}
