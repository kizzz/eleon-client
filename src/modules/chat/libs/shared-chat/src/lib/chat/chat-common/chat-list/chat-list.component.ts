import {
  Component,
  effect,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatListLatestComponent, LatestChatsService } from "src/modules/chat/libs/shared-chat/src";
import { ActivatedRoute } from '@angular/router'
import { first } from 'rxjs'
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: "app-chat-list",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"],
})
export class ChatListComponent implements OnInit {
  private noLatestChats = false;
  
  @ViewChildren(ChatListLatestComponent) latestChatsComponents =
    new QueryList<ChatListLatestComponent>();

  private _searchQuery: string = "";
  public get searchQuery(): string {
    return this._searchQuery;
  }
  public set searchQuery(value: string) {
    this._searchQuery = value;
    this.notifyNoChats();
  }
  
  public get loadingChats() { 
    return this.latestChats.loadingChats();
  }

  public searchText: string = "";
  public searchTags: string[] = [];
  public chatCreationDialogOpened = false;

  chatTabs = [
    { headerKey: "Collaboration::Chat:Tab" },
    { headerKey: "Collaboration::Channel:Tab"},
    { headerKey: "Collaboration::Archive:Tab" }
  ]

  isArchiveTab(index: number): boolean {
    return index === 2;
  }

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

  constructor(
		public latestChats: LatestChatsService,
		private route: ActivatedRoute) {
    effect(() => {
      const chats = this.latestChats.chats();
      this.noLatestChats = chats.length === 0;
      this.notifyNoChats();
    });
  }
  ngOnInit(): void {
		combineLatest([
      this.route.data,
      this.route.queryParams
    ])
    .pipe(
      first(),
      map(([data, query]) => {
      // Merge query over data, query has higher priority
      return { ...data, ...query };
      })
    )
    .subscribe(q => {
      if (!this.sideBarView) {
        const selectedChatId = q['chat'];
				const tags = q['tags'];
				if (tags) {
					this.searchTags = Array.isArray(tags) ? tags : tags.split(",");
					this.latestChats.refresh({tags: this.searchTags});
				}

        this.latestChats.loadChatById(selectedChatId).subscribe(chat => {
          if (chat) {
            this.selectChat(chat);
          } else {
						if (this.latestChats.chats().length === 0) {
							this.latestChats.chats$.pipe(filter(res => res.length !== 0), first()).subscribe(res => {
								if (res.length !== 0) {
									this.selectChat(res[0].data);
								}
							})
						}
						else{
							this.selectChat(this.latestChats.chats()[0].data);
						}
          }
        })
      }

      

      const channelsTab = q['tabLangKey'];
      if (channelsTab) {
      this.chatTabs[1].headerKey = channelsTab;
      }
    });
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

  public onShowDialogChange(show: boolean): void {
    this.chatCreationDialogOpened = show;
  }

  public loadMore(): void {
    this.latestChatsComponents.forEach((x) => x.loadMore());
  }

  private notifyNoChats(): void {
    if (!this.searching) {
      this.noChats = this.noLatestChats;
      this.noChatsChange.emit(this.noChats);
    }
  }

  get currentTab() : number {
    return this.latestChats.currentTab();
  }

  onTabChange(tab: number): void {
    const archived = tab == 2;
    const isChannels = tab == 1;
    this.latestChats.refresh({ isArchived: archived, isChannels: isChannels });
  }

	selectChat(chat: UserChatInfoDto): void {
		this.selectedChat = chat;
		this.selectedChatChange.emit(this.selectedChat);
		this.latestChats.setSelectedChat(chat);
	}
}
