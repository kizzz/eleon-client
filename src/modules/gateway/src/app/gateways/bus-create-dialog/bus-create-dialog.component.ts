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
  EventBusOptionsTemplateDto,
  EventBusService,
} from '@eleon/gateway-management-proxy';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  LocalizedEnumValue,
  mapEnumToLocalizedList,
} from '@eleon/primeng-ui.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { EventBusProvider } from '@eleon/gateway-management-proxy';
import { EventBusStatus } from '@eleon/gateway-management-proxy';

interface EventBus {
  originalData: EventBusDto;
  data: EventBusDto;
  provider: LocalizedEnumValue<EventBusProvider>;
  validators: {
    nameEmpty: boolean;
  };
}
@Component({
  standalone: false,
  selector: 'app-bus-create-dialog',
  templateUrl: './bus-create-dialog.component.html',
  styleUrls: ['./bus-create-dialog.component.scss'],
})
export class EventBusCreateDialogComponent implements OnInit {
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  @Input()
  public beforeButton: TemplateRef<any>;
  @Output()
  createdEventBus: EventEmitter<void> = new EventEmitter<void>();
  title: string;
  display: boolean = false;
  header: EventBus;
  creatingNewEventBus = false;
  eventBusStatuses: LocalizedEnumValue<EventBusStatus>[];
  eventBusProviders: LocalizedEnumValue<EventBusProvider>[];
  EventBusProvider = EventBusProvider;
  templates: EventBusOptionsTemplateDto[];

  jsonOptions = {
    language: 'json',
    readonly: false,
    automaticLayout: true,
  };
  darkMode: boolean = true;
  height: string = '40rem';
  readOnly: boolean = false;
  loading: boolean = false;
  showToolbar: boolean = true;

  constructor(
    public localizationService: ILocalizationService,
    public eventBusService: EventBusService,
    public messageService: LocalizedMessageService,
    public confirmationService: ConfirmationService,
    public state: PageStateService
  ) {}

  showDialog() {
    this.display = true;
    this.creatingNewEventBus = true;
    this.init();
    this.resetValidators();
    this.title = this.localizationService.instant(
      'EventBusManagement::EventBus:Settings:TitleNew'
    );
  }

  ngOnInit(): void {
    this.eventBusStatuses = mapEnumToLocalizedList(
      EventBusStatus,
      this.localizationService,
      'EventBusManagement::EventBusStatus'
    );

    this.eventBusProviders = mapEnumToLocalizedList(
      EventBusProvider,
      this.localizationService,
      'EventBusManagement::EventBusProvider'
    ).filter((x) => x.value !== EventBusProvider.Undefined) as any;

    this.eventBusService
      .getEventBusOptionsTemplates()
      .subscribe(
        (templates) => ((this.templates = templates), this.setTemplate())
      );
  }

  resetValidators(): void {
    this.header.validators.nameEmpty = false;
  }

  setTemplate(): void {
    if (!this.templates?.length) return;

    this.header.data.providerOptions = this.templates.find(
      (x) => x.provider === this.header.provider.value
    )?.template;
  }

  validateEventBus(): boolean {
    let errors: string[] = [];

    // if (!this.header?.data?.name?.length) {
    //   this.header.validators.nameEmpty = true;
    //   errors.push('EventBusManagement::EventBus:Errors:NameEmpty');
    // }

    if (errors.length === 0) return true;
    for (const err of errors) {
      this.messageService.error(err);
    }
    return false;
  }

  saveEventBus(): void {
    const valid = this.validateEventBus();
    if (!valid) return;
    const eventBusDto: EventBusDto = {
      ...this.header.data,
      provider: this.header.provider.value,
    };

    this.sendAddEventBusRequest(eventBusDto);
  }

  sendAddEventBusRequest(eventBusDto: EventBusDto): void {
    this.eventBusService.addEventBusByEventBus(eventBusDto).subscribe({
      next: () => {
        this.creatingNewEventBus = false;
        this.messageService.success(
          'EventBusManagement::EventBus:Settings:SaveSuccess'
        );
        this.createdEventBus.emit();
        this.display = false;
      },
      error: () => {
        this.messageService.error(
          'EventBusManagement::EventBus:Settings:SaveError'
        );
      },
    });
  }

  createEventBus(): void {
    this.init();
    this.resetValidators();
  }

  init(eventBusDto?: EventBusDto): void {
    this.header = {
      data: {
        ...eventBusDto,
      },
      originalData: { ...eventBusDto },
      provider: this.eventBusProviders.find(
        (x) =>
          x.value === (eventBusDto?.provider || EventBusProvider.MassTransit)
      ),
      validators: {
        nameEmpty: false,
      },
    };
    this.setTemplate();
  }

  closeDialog() {
    this.resetValidators();
    this.header.data.providerOptions = null;
    // this.header.data.name = null;
    this.display = false;
  }

  get changeSize() {
    return window.screen.width < 1008;
  }
}
