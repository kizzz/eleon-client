import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MenuItem } from "primeng/api";

@Component({
  standalone: false,
  selector: "app-user-chats-controls",
  templateUrl: "./user-chats-controls.component.html",
  styleUrls: ["./user-chats-controls.component.scss"],
})
export class UserChatsControlsComponent {
  showCreateGroupChatModal: boolean = false;

  @Input()
  searchText: string;
  @Output()
  searchTextChange = new EventEmitter<string>();

  constructor() {}

  createGroupChat(): void {
    this.showCreateGroupChatModal = true;
  }

  onSearchTextChanged(text: string): void {
    this.searchTextChange.emit(text);
  }
}
