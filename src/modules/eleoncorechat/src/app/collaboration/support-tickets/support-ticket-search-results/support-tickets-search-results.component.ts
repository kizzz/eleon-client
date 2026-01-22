import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatInteractionService } from '@eleon/collaboration-proxy';
import { ChatRoomType } from '@eleon/collaboration-proxy';
import { finalize } from "rxjs";

@Component({
  standalone: false,
  selector: "app-support-tickets-search-results",
  templateUrl: "./support-tickets-search-results.component.html",
  styleUrls: ["./support-tickets-search-results.component.scss"],
})
export class SupportTicketSearchResultsComponent implements OnChanges {
  private pageSize = 10;

  public loading: boolean = false;
  public chats: UserChatInfoDto[] = [];

  @Input()
  public searchQuery: string;

  @Input()
  public selectedChat: UserChatInfoDto;
  @Output()
  public selectedChatChange = new EventEmitter<UserChatInfoDto>();

  @Input()
  noChats = false;
  @Output()
  noChatsChange = new EventEmitter<boolean>();

  @Input()
  public chatRoomTypes: ChatRoomType[] = [ChatRoomType.SupportTicket];

  constructor(private chatService: ChatInteractionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchQuery"]) {
      this.initChats();
    }
  }

  public loadMore(): void {
    this.loadChats(this.chats.length);
  }

  private initChats(): void {
    this.chats = [];
    this.loadChats(0);
  }

  private loadChats(skip: number): void {
    this.loading = true;
    this.chatService
      .getLastChatsByRequest({
        skip: skip,
        take: this.pageSize,
        nameFilter: this.searchQuery,
        chatRoomTypes: this.chatRoomTypes,
				isArchived: false,
        isChannel: false,
        tags: [],
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((paged) => {
        this.chats = [...this.chats, ...paged.items];
        if (this.chats.length === 0) {
          this.noChats = true;
          this.noChatsChange.emit(true);
        } else {
          this.noChats = false;
          this.noChatsChange.emit(false);
        }
      });
  }
}
