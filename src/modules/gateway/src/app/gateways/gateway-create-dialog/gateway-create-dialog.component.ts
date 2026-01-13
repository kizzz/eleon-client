import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { GatewayProtocol, GatewayStatus } from '@eleon/gateway-management-proxy';
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
  selector: 'app-gateway-create-dialog',
  templateUrl: './gateway-create-dialog.component.html',
  styleUrls: ['./gateway-create-dialog.component.scss']
})
export class GatewayCreateDialogComponent implements OnInit {
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  @Input()
  public beforeButton: TemplateRef<any>;
  @Output()
  createdGateway: EventEmitter<string> = new EventEmitter<string>();
  title: string;
  display: boolean = false;
  header: Gateway;
  creatingNewGateway = false;
  gatewayStatuses: LocalizedEnumValue<GatewayStatus>[];

  constructor(
    public localizationService: ILocalizationService,
    public gatewayService: GatewayManagementService,
    public messageService: LocalizedMessageService,
    public confirmationService: ConfirmationService,
    public state: PageStateService
  ) {}

  showDialog() {
    this.display = true;
    this.creatingNewGateway = true;
    this.init();
    this.resetValidators();
    this.title = this.localizationService.instant('GatewayManagement::Gateway:Settings:TitleNew');
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
    this.gatewayService
      .addGatewayByGateway(gatewayDto)
      .subscribe({
        next: newId => {
          if (newId) {
            this.creatingNewGateway = false;
            this.messageService.success('GatewayManagement::Gateway:Settings:SaveSuccess');
            this.createdGateway.emit(newId);
            this.display = false;
          } else {
            this.messageService.error('GatewayManagement::Gateway:Settings:SaveFail');
          }
        },
        error: () => {
          this.messageService.error('GatewayManagement::Gateway:Settings:SaveError');
        },
      });
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
      status: this.gatewayStatuses.find(
        x => x.value === gatewayDto?.status
      ),
      validators: {
        nameEmpty: false,
      },
    };
  }

  closeDialog(){
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
