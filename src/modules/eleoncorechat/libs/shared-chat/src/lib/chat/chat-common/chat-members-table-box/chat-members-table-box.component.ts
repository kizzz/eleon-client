import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IUserService, CommonUserDto } from '@eleon/angular-sdk.lib';
import { LazyLoadEvent, MessageService } from "primeng/api";
import { finalize } from "rxjs";
import { ChangeDetectorRef } from '@angular/core';

interface UserRow {
  data: CommonUserDto;
  isPreselected: boolean;
  userName: string;
}

@Component({
  standalone: false,
  selector: "app-chat-members-table-box",
  templateUrl: "./chat-members-table-box.component.html",
  styleUrls: ["./chat-members-table-box.component.scss"],
})
export class ChatMembersSelectionBoxComponent {
  loading: boolean = false;
  rows: UserRow[];
  rowsCount: number;
  pageSize: number = 5;
  selectAll: boolean = false;
  filter: string;
  selectedRows: UserRow[] = [];
  lastLazyLoadEvent: LazyLoadEvent;

  @Input()
  selectionMode: "single" | "multiple" = "multiple";

  @Input()
  preselectedUsers: string[];

  @Input()
  selectedUsers: CommonUserDto[] = [];
  @Output()
  selectedUsersChange = new EventEmitter<CommonUserDto[]>();

  @Output()
  userSelected: EventEmitter<CommonUserDto> = new EventEmitter<CommonUserDto>();

  constructor(
    public userService: IUserService,
    public messageService: MessageService,
    public configService: IApplicationConfigurationManager,
    public localizationService: ILocalizationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
  }

  loadUsers(event: LazyLoadEvent) {
    this.lastLazyLoadEvent = event;
    this.loading = true;
    this.userService
      .getList({
        maxResultCount: this.pageSize,
        skipCount: event.first,
        sorting: "1",
        filter: this.filter,
        permissions: null,
        ignoreCurrentUser: true,
				ignoredUsers: null,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((paged) => {
        this.rowsCount = paged.totalCount;
        this.rows = paged.items
          .map((x) => ({
            data: x,
            isPreselected: !!this.preselectedUsers?.includes(x.id),
            userName: this.getUserName(x),
          }));
        this.loading = false;
      });
  }

  reload(): void {
    if (this.lastLazyLoadEvent) {
      this.loadUsers(this.lastLazyLoadEvent);
    }
  }

	filterTimeout: any;
  onFilterChange(): void {
		if (this.filterTimeout) {
			clearTimeout(this.filterTimeout);
		}
		this.filterTimeout = setTimeout(() => {
			this.reload();
		}, 500);
  }

  onSelectionChange(selection: UserRow[]): void {
    this.selectedUsers = selection.map((x) => x.data);
    this.selectedUsersChange.emit(this.selectedUsers);
  }

  private getUserName(user: CommonUserDto) {
    const hasName = user.name?.length;
    const hasSurname = user.surname?.length;
    const hasFullName = hasName && hasSurname;
    if (hasFullName) {
      return `${user.name} ${user.surname}`;
    }

    if (hasName) {
      return user.name;
    }
    
    if (hasSurname) {
      return user.surname;
    }

    return user.userName;
  }
}
