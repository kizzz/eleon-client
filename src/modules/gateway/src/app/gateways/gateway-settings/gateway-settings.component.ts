import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { GatewayAngularService } from '../gateway.service';
import { Subject, takeUntil } from 'rxjs';

interface Gateway {
  originalData: GatewayDto;
  data: GatewayDto;
  protocol: LocalizedEnumValue<GatewayProtocol>;
  validators: {
    nameEmpty: boolean;
    ipAddressEmpty: boolean;
    portEmpty: boolean;
  };
}

@Component({
  standalone: false,
  selector: 'app-gateway-settings',
  templateUrl: './gateway-settings.component.html',
  styleUrls: ['./gateway-settings.component.scss'],
})
export class GatewaySettingsComponent implements OnInit {
  IPv4AddressKeyFilter: RegExp =
    /(^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)/;
  defaultPortNumber = 44320;

  private _editedId: string;
  public get editedId(): string {
    return this._editedId;
  }
  @Input()
  public set editedId(value: string) {
    this._editedId = value;
    this.loadGateway();
  }

  @Output()
  editedIdChange = new EventEmitter<string>();

  @Output()
  save = new EventEmitter<string>();

  @Output()
  back = new EventEmitter<void>();

  header: Gateway;
  title: string;
  creatingNewGateway = false;
  gatewayStatuses: LocalizedEnumValue<GatewayStatus>[];
  gatewayProtocols: LocalizedEnumValue<GatewayProtocol>[];
  GatewayProtocol = GatewayProtocol;
  editMode: boolean = false;
  loading: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public localizationService: ILocalizationService,
    public gatewayService: GatewayManagementService,
    public messageService: LocalizedMessageService,
    public router: Router,
    public route: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public state: PageStateService,
    private gatewayAngularService : GatewayAngularService
  ) {}

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
    this.gatewayProtocols = mapEnumToLocalizedList(
      GatewayProtocol,
      this.localizationService,
      'GatewayManagement::GatewayProtocol'
    );
    this.loadGateway();

    this.gatewayAngularService.editClicked$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => {
      this.editMode = value;
      if(value){
        this.state.setDirty();
      }
    });

    this.gatewayAngularService.cancelEditClicked$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => {
      if(value){
        this.state.setNotDirty();
        this.loadGateway();
      }
    });
    this.gatewayAngularService.saveClicked$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => {
      if(value){
        this.saveGateway();
      }
    });
  }

  loadGateway(): void {
    if (!this.header) return;

    if (this.editedId && this.editedId !== 'new') {
      this.loading = true;
      this.gatewayService.getGatewayByGatewayId(this.editedId).subscribe({
        next: gateway => {
          this.loading = false;
          this.creatingNewGateway = false;
          this.init(gateway);
          this.resetValidators();
          this.title = this.localizationService.instant(
            'GatewayManagement::Gateway:Settings:TitleEdit',
            '"'+gateway.name+'"'
          );
        },
      });
    } else {
      this.creatingNewGateway = true;
      this.init();
      this.resetValidators();
      this.title = this.localizationService.instant('GatewayManagement::Gateway:Settings:TitleNew');
    }
  }

  init(gatewayDto?: GatewayDto): void {
    this.header = {
      data: {
        ...gatewayDto,
        port: gatewayDto?.port || this.defaultPortNumber,
      },
      originalData: { ...gatewayDto },
      protocol: this.gatewayProtocols?.find(
        x => x.value === (gatewayDto?.protocol || GatewayProtocol.HTTPS)
      ),
      validators: {
        nameEmpty: false,
        ipAddressEmpty: false,
        portEmpty: false,
      },
    };
  }

  resetForm(): void {
    this.init(this.header?.data);
    this.resetValidators();
  }

  resetValidators(): void {
    this.header.validators.nameEmpty = false;
    this.header.validators.ipAddressEmpty = false;
    this.header.validators.portEmpty = false;
  }

  validateGateway(): boolean {
    let errors: string[] = [];

    if (!this.header?.data?.name?.length) {
      this.header.validators.nameEmpty = true;
      errors.push('GatewayManagement::Gateway:Errors:NameEmpty');
    }

    if (this.header.protocol.value === GatewayProtocol.HTTPS) {
      if (
        !this.header.data?.ipAddress?.length ||
        !this.IPv4AddressKeyFilter.test(this.header.data.ipAddress)
      ) {
        this.header.validators.ipAddressEmpty = true;
        errors.push('GatewayManagement::Gateway:Errors:IpEmptyOrInvalid');
      }

      if (!this.header?.data?.port) {
        this.header.validators.portEmpty = true;
        errors.push('GatewayManagement::Gateway:Errors:PortEmptyOrInvalid');
      }
    }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  isValidIPAddress(): boolean {
    let isValid = false;
    if(!this.header?.data?.ipAddress?.length){
      return false;
    }
    isValid = this.IPv4AddressKeyFilter.test(this.header?.data?.ipAddress);
    return isValid;
  }

  saveGateway(): void {
    const valid = this.validateGateway();
    if (!valid) return;
    const gatewayDto: GatewayDto = {
      ...this.header.data,
      protocol: this.header.protocol.value,
    };

    if (this.header?.data?.id) {
      this.sendUpdateGatewayRequest(gatewayDto);
    } else {
      this.sendAddGatewayRequest(gatewayDto);
    }
  }

  sendAddGatewayRequest(gatewayDto: GatewayDto): void {
    this.loading = true;
    this.gatewayService
      .addGatewayByGateway(gatewayDto)
      .subscribe({
        next: newId => {
          this.loading = false;
          if (newId) {
            this.editedId = newId;
            this.editedIdChange.emit(this.editedId);
            this.creatingNewGateway = false;
            this.loadGateway();
            this.state.setNotDirty();
            this.messageService.success('GatewayManagement::Gateway:Settings:SaveSuccess');
          } else {
            this.messageService.error('GatewayManagement::Gateway:Settings:SaveFail');
          }
        },
        error: () => {
          this.messageService.error('GatewayManagement::Gateway:Settings:SaveError');
        },
      });
  }

  sendUpdateGatewayRequest(gatewayDto: GatewayDto): void {
    this.loading = true;
    // this.gatewayService
    //   .updateGatewayByGateway(gatewayDto)
    //   .subscribe({
    //     next: wasSaved => {
    //       this.loading = false;
    //       if (wasSaved) {
    //         this.save.emit();
    //         this.loadGateway();
    //         this.state.setNotDirty();
    //         this.messageService.success('GatewayManagement::Gateway:Settings:SaveSuccess');
    //       } else {
    //         this.messageService.error('GatewayManagement::Gateway:Settings:SaveFail');
    //       }
    //     },
    //     error: () => {
    //       this.messageService.error('GatewayManagement::Gateway:Settings:SaveError');
    //     },
    //   });
  }

  createGateway(): void {
    this.editedId = undefined;
    this.editedIdChange.emit(this.editedId);
    this.init();
    this.resetValidators();
  }

  onBack(): void {
    if(this.state.isDirty){
      this.confirmationService.confirm({
        message: this.localizationService.instant(
          "GatewayManagement::ClickedOnBackIfDirty"
        ),
        accept: () => {
          this.editMode = false;
          this.state.setNotDirty();
          this.back.emit();
        },
        reject:() => {
          return;
        },
        acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
        rejectLabel: this.localizationService.instant("Infrastructure::No"),
      });
    }
    else{
      this.back.emit();
    }
  }
  
  getProtocolName(protocol: number){
    return this.localizationService.instant(
      'GatewayManagement::GatewayProtocol:' + GatewayProtocol[protocol]
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
