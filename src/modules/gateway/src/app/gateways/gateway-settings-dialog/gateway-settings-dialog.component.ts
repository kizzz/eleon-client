import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  EventBusDto,
  EventBusService,
  GatewayProtocol,
  GatewayStatus,
} from '@eleon/gateway-management-proxy';
import { GatewayManagementService } from '@eleon/gateway-management-proxy';
import { GatewayDto } from '@eleon/gateway-management-proxy';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  LocalizedEnumValue,
  mapEnumToLocalizedList,
} from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';

interface Gateway {
  originalData: GatewayDto;
  data: GatewayDto;
  status: LocalizedEnumValue<GatewayStatus>;
  validators: {
    nameEmpty: boolean;
  };
}
@Component({
  standalone: false,
  selector: 'app-gateway-settings-dialog',
  templateUrl: './gateway-settings-dialog.component.html',
  styleUrls: ['./gateway-settings-dialog.component.scss'],
})
export class GatewaySettingsDialogComponent implements OnInit {
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  @Input()
  public beforeButton: TemplateRef<any>;
  @Output()
  settingsChanged: EventEmitter<string> = new EventEmitter<string>();
  title: string;
  display: boolean = false;
  header: Gateway;
  creatingNewGateway = false;
  gatewayStatuses: LocalizedEnumValue<GatewayStatus>[];
  eventBuses: EventBusDto[];

  constructor(
    public localizationService: ILocalizationService,
    public gatewayService: GatewayManagementService,
    public messageService: LocalizedMessageService,
    public confirmationService: ConfirmationService,
    public state: PageStateService,
    public eventBusService: EventBusService
  ) {}

  showDialog(dto: GatewayDto) {
    this.display = true;
    this.creatingNewGateway = true;
    this.init(dto);
    this.resetValidators();
    this.title = this.localizationService.instant(
      'GatewayManagement::Gateway:Settings:TitleEdit',
      dto.name
    );
  }

  ngOnInit(): void {
    this.header = {
      data: {} as any,
      validators: {} as any,
    } as any;
    this.gatewayStatuses = mapEnumToLocalizedList(
      GatewayStatus,
      this.localizationService,
      'GatewayManagement::GatewayStatus'
    );

    this.eventBusService.getEventBuses().subscribe((buses) => {
      this.eventBuses = buses;
    });
  }

  resetValidators(): void {
    this.header.validators.nameEmpty = false;
  }

  validateGateway(): boolean {
    let errors: string[] = [];

    if (!this.header?.data?.name?.length) {
      this.header.validators.nameEmpty = true;
      errors.push('GatewayManagement::Gateway:Errors:NameEmpty');
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  saveGateway(): void {
    const valid = this.validateGateway();
    if (!valid) return;
    const gatewayDto: GatewayDto = {
      ...this.header.data,
      status: this.header.status.value,
    };

    this.sendAddGatewayRequest(gatewayDto);
  }

  sendAddGatewayRequest(gatewayDto: GatewayDto): void {
    // this.gatewayService.updateGatewayByGateway(gatewayDto).subscribe({
    //   next: () => {
    //     this.creatingNewGateway = false;
    //     this.messageService.success(
    //       'GatewayManagement::Gateway:Settings:SaveSuccess'
    //     );
    //     this.settingsChanged.emit(gatewayDto.id);
    //     this.display = false;
    //   },
    //   error: () => {
    //     this.messageService.error(
    //       'GatewayManagement::Gateway:Settings:SaveError'
    //     );
    //   },
    // });
  }

  createGateway(): void {
    this.init();
    this.resetValidators();
  }

  init(gatewayDto?: GatewayDto): void {
    this.header = {
      data: {
        ...gatewayDto,
      },
      originalData: { ...gatewayDto },
      status: this.gatewayStatuses.find((x) => x.value === gatewayDto?.status),
      validators: {
        nameEmpty: false,
      },
    };
  }

  closeDialog() {
    this.resetValidators();
    this.header.data.name = null;
    this.header.data.ipAddress = null;
    this.header.data.port = null;
    this.display = false;
  }

  get changeSize() {
    return window.screen.width < 1008;
  }
}
