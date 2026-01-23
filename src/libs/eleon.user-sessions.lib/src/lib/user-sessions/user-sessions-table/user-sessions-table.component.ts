import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UserSessionDto } from '@eleon/system-services.lib';
import { SimpleChanges } from '@angular/core';
import { OnChanges } from '@angular/core';

@Component({
	standalone: false,
	selector: "app-user-sessions-table",
	templateUrl: "./user-sessions-table.component.html",
	styleUrls: ["./user-sessions-table.component.css"]
})
export class UserSessionsTableComponent implements OnChanges {
	protected rowsCount = 10;
	protected get totalRecords() {
		return this.filtered?.length || 0;
	}

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['sessions']) {
      this.search();
    }
  }

  filtered: UserSessionDto[] = [];

	@Input()
	public sessions: UserSessionDto[] = []

	@Input()
	public loading: boolean = true;

	@Output()
  public refreshEvent = new EventEmitter<void>();

  @Output()
  public revokeSessionEvent = new EventEmitter<string>();

	refresh() {
    this.refreshEvent.emit();
  }

  revokeSession(sessionId: string) {
    this.revokeSessionEvent.emit(sessionId);
  }

  searchQueryText: string = '';
  search(){
    this.searchQueryText = this.searchQueryText?.trim().toLowerCase() || '';
    if (this.searchQueryText) {
      this.filtered = this.sessions.filter(session => {
      return session.browser?.toLowerCase().includes(this.searchQueryText) ||
             session.ipAddress?.toLowerCase().includes(this.searchQueryText) ||
             session.device?.toLowerCase().includes(this.searchQueryText) ||
             session.signInDate?.toString().toLowerCase().includes(this.searchQueryText) ||
             session.lastAccessTime?.toString().toLowerCase().includes(this.searchQueryText);
      });
    }
    else {
      this.filtered = this.sessions;
    }
  }

  clear(){
    this.searchQueryText = '';
    this.search();
  }
}