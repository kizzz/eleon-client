import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  AcceptPendingGatewayRequestDto,
  GatewayProtocol,
  GatewayStatus,
} from '@eleon/gateway-management-proxy';
import { GatewayManagementService } from '@eleon/gateway-management-proxy';
import { GatewayDto } from '@eleon/gateway-management-proxy';
import { LocalizedConfirmationService } from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';

interface GatewayRow {
  data: GatewayDto;
  localizedStatus: string;
  localizedProtocol: string;
  editing: boolean;
}

@Component({
  standalone: false,
  selector: 'app-gateways-list',
  templateUrl: './gateways-list.component.html',
  styleUrls: ['./gateways-list.component.scss'],
})
export class GatewaysListComponent implements OnInit {
  acceptingInProcess: boolean = false;
  unfilteredGateways: GatewayRow[];
  acceptedGateways: GatewayRow[];
  pendingGateways: GatewayRow[];
  ignoredGateways: GatewayRow[];
  loading: boolean;
  searchQueryText: string;
  searchQuery: string;

  @Input()
  public set refreshId(value: string) {
    this.loadGateways();
  }

  editedRow: GatewayRow;

  @Output()
  edit = new EventEmitter<string>();

  @Output()
  create = new EventEmitter<void>();

  constructor(
    public gatewayService: GatewayManagementService,
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private confirmationService: LocalizedConfirmationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadGateways();
  }

  search() {
    this.searchQuery = this.searchQueryText;

    this.acceptedGateways = this.unfilteredGateways.filter(
      (x) =>
        [GatewayStatus.Active].includes(x.data.status) &&
        (!this.searchQuery?.length || x.data.name.includes(this.searchQuery))
    );
    this.pendingGateways = this.unfilteredGateways.filter(
      (x) =>
        [
          GatewayStatus.New,
          GatewayStatus.WaitingForAccept,
          GatewayStatus.WaitingForConfirmation,
          GatewayStatus.WaitingForRegistration,
        ].includes(x.data.status) &&
        (!this.searchQuery?.length || x.data.name.includes(this.searchQuery))
    );
    this.ignoredGateways = this.unfilteredGateways.filter(
      (x) =>
        [GatewayStatus.Rejected].includes(x.data.status) &&
        (!this.searchQuery?.length || x.data.name.includes(this.searchQuery))
    );
  }

  clear() {
    this.searchQueryText = '';
    this.search();
  }

  loadGateways(): void {
    this.loading = true;
    this.gatewayService
      .getGatewayListByRequest({ statusFilter: undefined })
      .subscribe((list) => {
        this.unfilteredGateways = list.map((x) => ({
          data: x,
          localizedStatus: this.localizationService.instant(
            'GatewayManagement::GatewayStatus:' + GatewayStatus[x.status]
          ),
          localizedProtocol: this.localizationService.instant(
            'GatewayManagement::GatewayProtocol:' + GatewayProtocol[x.protocol]
          ),
          editing: false,
        }));

        this.clear();

        this.loading = false;
      });
  }

  editRow(editedRow: any): void {
    this.edit.emit(editedRow.data.data.id);
  }

  removeGateway(row: GatewayRow): void {
    this.confirmationService.confirm(
      'GatewayManagement::ConfirmRemovingGateway',
      () => {
        this.loading = true;
        this.gatewayService
          .removeGatewayByGatewayId(row.data.id)
          .subscribe(() => {
            this.loadGateways();
            this.messageService.success(
              'GatewayManagement::GatewayRemovedSuccessfully'
            );
          });
      }
    );
  }

  onCreate(): void {
    this.create.emit();
  }

  createGateway(id) {
    this.edit.emit(id);
  }

  public showAccept(row: GatewayRow): boolean {
    return row.data.status === GatewayStatus.WaitingForAccept;
  }

  public showReject(row: GatewayRow): boolean {
    return row.data.status === GatewayStatus.WaitingForAccept;
  }

  public acceptGateway(row: GatewayRow): void {
    if (!this.acceptingInProcess) {
      this.acceptingInProcess = true;
      row.editing = true;
      return;
    }

    if (!row.data.name?.length) {
      this.messageService.error(
        'GatewayManagement::Gateways:Accept:NameRequired'
      );
      return;
    }

    this.gatewayService
      .acceptPendingGatewayByRequest({
        name: row.data.name,
        gatewayId: row.data.id,
      } satisfies AcceptPendingGatewayRequestDto)
      .subscribe(() => {
        this.loadGateways();
        this.messageService.success(
          'GatewayManagement::Gateways:AcceptSuccess'
        );
        row.editing = false;
      });
  }

  public cancelAccepting(row: GatewayRow): void {
    row.editing = false;
    row.data.name = null;
    this.acceptingInProcess = false;
  }

  public rejectGateway(row: GatewayRow): void {
    this.gatewayService
      .rejectPendingGatewayByGatewayId(row.data.id)
      .subscribe(() => {
        this.loadGateways();
        this.messageService.warn('GatewayManagement::Gateways:RejectSuccess');
      });
  }
}
