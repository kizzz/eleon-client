import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { LatestChat } from "../chat-types";

import {
  LatestChatsManager,
  LatestChatsService,
  LatestSupportTicketsService,
} from "../chat-services/latest-chats.service";
import { map, tap } from "rxjs";

@Component({
  standalone: false,
  selector: "app-chat-list-latest",
  templateUrl: "./chat-list-latest.component.html",
  styleUrls: ["./chat-list-latest.component.scss"],
})
export class ChatListLatestComponent implements OnInit, OnChanges {
  private chatsManager: LatestChatsManager;

  public get chats$() {
    return this.chatsManager.chats$.pipe(
      map((x) => {
        if(this.chatsLimit > 0) return x.slice(0, this.chatsLimit).map((y) => y.data)
        return x.map((y) => y.data)
      }),
      tap((x) => {
        if (x.length === 0) {
          this.noChatsChange.emit(true);
        }
      })
    );
  }

  public get chats(){
    const chats = this.chatsManager.chats();
    if (this.chatsLimit > 0) {
      return chats?.slice(0, this.chatsLimit).map((x) => x.data) || [];
    }
    return chats?.map((x) => x.data) || [];
  }

  @Input()
  public searchQuery: string;

  @Input()
  public archived: boolean = false;

  @Input()
  public menuView: boolean = false;

  @Input()
  sideBarView = false;

  @Input()
  public selectedChat: UserChatInfoDto;
  @Output()
  public selectedChatChange = new EventEmitter<UserChatInfoDto>();

  @Input()
  noChats = false;
  @Output()
  noChatsChange = new EventEmitter<boolean>();

  @Input()
  mode: "chats" | "tickets" = "chats";

  @Input()
  public chatsLimit: number = 0;

  constructor(
    private latestChatsService: LatestChatsService,
    private latestTicketsService: LatestSupportTicketsService
  ) {}

  public ngOnInit(): void {
    if (this.mode === "chats") {
      this.chatsManager = this.latestChatsService;
    } else {
      this.chatsManager = this.latestTicketsService;
    }
    this.chatsManager.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchQuery"] || changes["archived"]) {
      this.chatsManager.refresh({
        searchQuery: this.searchQuery,
        isArchived: this.archived
      });
    }
  }

  public onSelectionChange(selected: UserChatInfoDto): void {
    if (!this.menuView) {
      this.selectedChat = selected;
    }

    this.selectedChatChange.emit(selected);
  }

  public loadMore(): void {
    this.chatsManager.loadMore();
  }
}
