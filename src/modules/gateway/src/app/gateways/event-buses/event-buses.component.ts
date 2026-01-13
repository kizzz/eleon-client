import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusDto, EventBusService } from '@eleon/gateway-management-proxy';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { EventBusProvider } from '@eleon/gateway-management-proxy';
import { EventBusStatus } from '@eleon/gateway-management-proxy';

interface EventBusRow {
  data: EventBusDto;
  localizedStatus: string;
  localizedProvider: string;
}

@Component({
  standalone: false,
  selector: 'app-event-buses',
  templateUrl: './event-buses.component.html',
  styleUrls: ['./event-buses.component.scss'],
})
export class EventBusesComponent implements OnInit {
  unfilteredEventBuses: EventBusRow[];
  eventBuses: EventBusRow[];
  loading: boolean;
  searchQueryText: string;
  searchQuery: string;
  editedRow: EventBusRow;

  constructor(
    public eventBusService: EventBusService,
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private confirmationService: LocalizedConfirmationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadEventBuses();
  }

  search() {
    this.searchQuery = this.searchQueryText;
    // this.eventBuses = this.unfilteredEventBuses.filter((x) =>
    //   x.data.name.includes(this.searchQuery)
    // );
  }

  clear() {
    this.searchQueryText = '';
    this.search();
  }

  loadEventBuses(): void {
    this.loading = true;
    this.eventBusService.getEventBuses().subscribe((list) => {
      this.unfilteredEventBuses = list.map((x) => ({
        data: x,
        localizedStatus: this.localizationService.instant(
          'EventBusManagement::EventBusStatus:' + EventBusStatus[x.status]
        ),
        localizedProvider: EventBusProvider[x.provider],
      }));
      this.eventBuses = [...this.unfilteredEventBuses];
      this.loading = false;
    });
  }

  // removeEventBus(row: EventBusRow): void {
  //   this.confirmationService.confirm(
  //     "EventBusManagement::ConfirmRemovingEventBus",
  //     () => {
  //       this.loading = true;
  //       this.eventBusService.removeEventBusByEventBusId(row.data.id).subscribe(() => {
  //         this.loadEventBuses();
  //         this.messageService.success(
  //           "EventBusManagement::EventBusRemovedSuccessfully"
  //         );
  //       });
  //     }
  //   );
  // }
}
