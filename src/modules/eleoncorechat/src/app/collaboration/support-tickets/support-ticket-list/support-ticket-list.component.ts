import {
  Component,
  effect,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { SupportTicketSearchResultsComponent } from "../support-ticket-search-results/support-tickets-search-results.component";
import { ChatListLatestComponent, LatestSupportTicketsService } from "src/modules/eleoncorechat/libs/shared-chat/src";

@Component({
  standalone: false,
  selector: "app-support-ticket-list",
  templateUrl: "./support-ticket-list.component.html",
  styleUrls: ["./support-ticket-list.component.scss"],
})
export class SupportTicketListComponent {
  private noLatestChats = false;

  @ViewChildren(ChatListLatestComponent) latestChatsComponents =
    new QueryList<ChatListLatestComponent>();
  @ViewChildren(SupportTicketSearchResultsComponent) chatSearchComponents =
    new QueryList<SupportTicketSearchResultsComponent>();

  private _searchQuery: string = "";
  public get searchQuery(): string {
    return this._searchQuery;
  }
  public set searchQuery(value: string) {
    this._searchQuery = value;
    this.notifyNoChats();
  }

  public searchText: string = "";
  public chatCreationDialogOpened = false;

  @Input()
  public selectedChat: UserChatInfoDto;
  @Output()
  public selectedChatChange = new EventEmitter<UserChatInfoDto>();

  @Input()
  noChats = false;
  @Output()
  noChatsChange = new EventEmitter<boolean>();

  constructor(tickets: LatestSupportTicketsService) {
    effect(() => {
      const chats = tickets.chats();
      this.noLatestChats = chats.length === 0;
      this.notifyNoChats();
    })
  }

  public get searching(): boolean {
    return this.searchQuery?.length > 0;
  }

  public search(): void {
    this.searchQuery = this.searchText;
  }

  public clearSearch(): void {
    this.searchText = "";
    this.searchQuery = "";
  }

  public onSearchInput(): void {
    if (this.searching && this.searchText.length === 0) {
      this.clearSearch();
    }
  }

  public onCreate(): void {
    this.chatCreationDialogOpened = true;
  }

  public loadMore(): void {
    this.latestChatsComponents.forEach((x) => x.loadMore());
    this.chatSearchComponents.forEach((x) => x.loadMore());
  }

  private notifyNoChats(): void {
    if (!this.searching) {
      this.noChats = this.noLatestChats;
      this.noChatsChange.emit(this.noChats);
    }
  }
}
