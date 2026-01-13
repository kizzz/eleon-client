import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { GatewayStatus } from '@eleon/gateway-management-proxy';
import { GatewayManagementService } from '@eleon/gateway-management-proxy';
import {
  GatewayDto,
  GatewayRegistrationKeyDto,
} from '@eleon/gateway-management-proxy';
import { ConfirmationService } from "primeng/api";
import {
  LocalizedEnumValue,
  mapEnumToLocalizedList,
} from "@eleon/primeng-ui.lib";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { parseUtc } from "@eleon/angular-sdk.lib";

@Component({
  standalone: false,
  selector: "app-gateway-status",
  templateUrl: "./gateway-status.component.html",
  styleUrls: ["./gateway-status.component.scss"],
})
export class GatewayStatusComponent implements OnInit, OnChanges {
  gatewayStatuses = GatewayStatus;
  @Input()
  gateway: GatewayDto;

  statusMsg: string;
  statusMsgs: LocalizedEnumValue<GatewayStatus>[];
  severity: string;

  loadedPrivateKey: GatewayRegistrationKeyDto;
  privateKeyExpired: boolean = false;

  inited: boolean;

  constructor(
    private localizationService: ILocalizationService,
    private state: PageStateService,
    private msgService: LocalizedMessageService,
    private gatewayService: GatewayManagementService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gateway']) {
      this.initStatusTitle(this.gateway?.status);
    }
  }

  ngOnInit(): void {
    this.statusMsgs = mapEnumToLocalizedList(
      GatewayStatus,
      this.localizationService,
      "GatewayManagement::GatewayStatus:DetailedMessage"
    );
  }

  initStatusTitle(status: GatewayStatus, attemptToLoadKey = true) {
    if (!status) return;
    if (
      status === GatewayStatus.WaitingForRegistration &&
      !this.loadedPrivateKey &&
      attemptToLoadKey
    ) {
      this.loadPrivateKey();
    } else if (
      status === GatewayStatus.WaitingForRegistration &&
      this.loadedPrivateKey
    ) {
      this.statusMsg = this.localizationService.instant(
        "GatewayManagement::Gateway:HereIsRegistrationKey"
      );
    } else {
      this.statusMsg = this.statusMsgs.find((x) => x.value === status).name;
    }

    this.severity = status === GatewayStatus.Active ? "success" : "warn";
    this.privateKeyExpired = false;
  }

  copyKey() {
    if (!this.loadedPrivateKey.key) return;
    navigator.clipboard.writeText(this.loadedPrivateKey.key);
    this.msgService.success("GatewayManagement::Gateway:CopyKeyToClipboard:Success");
  }

  onKeyExpired() {
    this.privateKeyExpired = true;
    this.severity = "error";
    this.statusMsg = this.localizationService.instant(
      "GatewayManagement::Gateway:RegistrationKeyExpired"
    );
  }

  requestRegistration() {
    this.gatewayService
      .requestGatewayRegistrationByGatewayId(this.gateway.id)
      .subscribe({
        next: (key) => {
          if (key) {
            this.msgService.success(
              "GatewayManagement::Gateway:RequestGatewayRegistration:Success"
            );
            this.gateway.status = GatewayStatus.WaitingForRegistration;
            this.loadedPrivateKey = key;
            this.initStatusTitle(this.gateway.status);
          } else {
            this.msgService.error(
              "GatewayManagement::Gateway:RequestGatewayRegistration:Fail"
            );
          }
        },
        error: () => {
          this.msgService.error(
            "GatewayManagement::Gateway:RequestGatewayRegistration:Error"
          );
        },
      });
  }

  revokeKey() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "GatewayManagement::Gateway:RegistrationKey:ConfirmRevoke"
      ),
      accept: () => {
        this.requestRegistration();
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
    });
  }

  cancelRegistration() {
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "GatewayManagement::Gateway:CancelRegistration:Confirm"
      ),
      accept: () => {
        this.gatewayService
          .cancelOngoingGatewayRegistrationByGatewayId(this.gateway.id)
          .subscribe(() => {
            this.loadedPrivateKey = null;
            this.gateway.status = GatewayStatus.New;
            this.initStatusTitle(this.gateway.status, false);
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
    });
  }

  loadPrivateKey() {
    this.gatewayService
      .getCurrentGatewayRegistrationKeyByGatewayId(this.gateway.id)
      .subscribe({
        next: (key) => {
          this.loadedPrivateKey = key;
          this.initStatusTitle(this.gateway.status, false);
        },
      });
  }
}
