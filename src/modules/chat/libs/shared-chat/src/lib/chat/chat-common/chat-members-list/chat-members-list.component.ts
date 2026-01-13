import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { ChatMemberInfo, ChatMemberService } from '@eleon/collaboration-proxy';
import { ChatMemberRole } from '@eleon/collaboration-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib'

@Component({
  standalone: false,
  selector: "app-chat-members-list",
  templateUrl: "./chat-members-list.component.html",
  styleUrls: ["./chat-members-list.component.scss"],
})
export class ChatMembersListComponent implements OnChanges {
  constructor(  
    private chatMemberService: ChatMemberService,
    private messageService: LocalizedMessageService) {

  }

  pageSize: number = 5;
  filteredMembers: ChatMemberInfo[] = [];

  ChatMemberRole = ChatMemberRole;

  public searchQuery: string = "";

  public get searching(): boolean {
    return this.searchQuery?.trim()?.length > 0;
  }

  @Input()
  chatId: string;

  @Input()
  members: ChatMemberInfo[];

  @Input()
  loading: boolean = false;

  @Input()
  allowEdit: boolean = false;

  @Input()
  showSearch: boolean = false;

  @Output()
  addUser = new EventEmitter<void>();

  @Output()
  kickUser = new EventEmitter<string>();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['members']) {
      this.search("");
    }
  }

  public search(query: string): void {
    if (this.searching) {
      this.filteredMembers = this.members.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.filteredMembers = this.members;
    }
  }

  public onKickUser(user: ChatMemberInfo): void {
    this.kickUser.emit(user.id);
  }

  public onAddUser(): void {
    this.addUser.emit();
  }

  public toggleUserRole(user: ChatMemberInfo): void {
    if (user.role === ChatMemberRole.Administrator) {
      user.role = ChatMemberRole.Regular;
      
    } else {
      user.role = ChatMemberRole.Administrator;
    }

    if (this.chatId){
      this.chatMemberService.setMemberRoleByChatIdAndUserIdAndMemberRole(this.chatId, user.id, user.role)
      .subscribe(res => this.messageService.success("Collaboration::RoleChanged"));

    }
  }
}
