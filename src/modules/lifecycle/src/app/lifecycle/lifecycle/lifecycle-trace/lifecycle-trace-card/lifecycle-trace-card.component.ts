import {
  Component,
  Input,
  input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FullStatesGroupTemplateDto,
  LifecycleActorTypes,
  LifecycleApprovalType,
  LifecycleFinishedStatus,
  StateActorAuditDto,
  StateActorTemplateDto,
  StateActorTemplateService,
  StatesGroupAuditDto,
  StatesGroupAuditService,
  StatesGroupAuditTreeDto,
  StatesGroupTemplateDto,
  StatesGroupTemplateService,
  StateTemplateDto,
  StateTemplateService,
} from '@eleon/lifecycle-feature-proxy';
import { ILocalizationService, LifecycleActorStatus, LifecycleStatus } from '@eleon/contracts.lib';
import { StateActorTypeOption } from '../../../state-actor-template-selection';
import { TraceCardMode } from './trace-card-mode';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

export interface ApprovalTypeOption {
  name: string;
  value: LifecycleApprovalType;
}

@Component({
  standalone: false,
  selector: 'app-lifecycle-trace-card',
  templateUrl: './lifecycle-trace-card.component.html',
  providers: [DatePipe],
  styleUrls: ['./lifecycle-trace-card.component.scss'],
})
export class LifecycleTraceCardComponent implements OnInit{
  @Input()
  mode: TraceCardMode = TraceCardMode.Template;
  @Input()
  fullStatesGroupTemplate: FullStatesGroupTemplateDto;
  @Input()
  statesGroupAuditTree: StatesGroupAuditTreeDto;
  @Input()
  stateGroupAudit: StatesGroupAuditDto;

  loading: boolean = false;
  approvalTypes: ApprovalTypeOption[];
  lifecycleActorTypes = LifecycleActorTypes;
  TraceCardMode = TraceCardMode;
  approversOptions: StateActorTypeOption[] = [];
  reviewersOptions: StateActorTypeOption[] = [];

  reviewersLoading: boolean = false;
  approversLoading: boolean = false;

  constructor(
    private localizationService: ILocalizationService,
    private datePipe: DatePipe,
    @Optional() private dialogConfig: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.fullStatesGroupTemplate = this.dialogConfig?.data?.fullStatesGroupTemplate || this.fullStatesGroupTemplate;
    this.statesGroupAuditTree = this.dialogConfig?.data?.statesGroupAuditTree || this.statesGroupAuditTree;
    this.stateGroupAudit = this.dialogConfig?.data?.stateGroupAudit || this.stateGroupAudit;
    this.mode = this.dialogConfig?.data?.mode || this.mode;
    this.approvalTypes = [
      {
        name: this.localizationService.instant(
          'Lifecycle::ApprovalType:Regular'
        ),
        value: LifecycleApprovalType.Regular,
      },
      {
        name: this.localizationService.instant(
          'Lifecycle::ApprovalType:Parallel'
        ),
        value: LifecycleApprovalType.Parallel,
      },
      {
        name: this.localizationService.instant(
          'Lifecycle::ApprovalType:AtLeast'
        ),
        value: LifecycleApprovalType.AtLeast,
      },
    ];
  }

  getTypeLocalization(type: LifecycleApprovalType) {
    return this.approvalTypes.find((t) => t.value === type).name;
  }

  getReviewers(actors: StateActorTemplateDto[]) {
    return actors.filter((a) => !a.isApprovalNeeded);
  }

  getApprovers(actors: StateActorTemplateDto[]) {
    return actors.filter((a) => a.isApprovalNeeded);
  }
  getGroupStatusValue(status: LifecycleStatus) {
    if (this.statesGroupAuditTree.states.find(s => s.currentStatus.key === LifecycleFinishedStatus.Rejected)) {
      return this.localizationService.instant('Lifecycle::LifecycleStatus:Rejected');
    }
    else if (this.statesGroupAuditTree.states.find(s => s.currentStatus.key !== LifecycleFinishedStatus.Approved)) {
      return this.localizationService.instant('Lifecycle::LifecycleStatus:Active');
    }
    return this.localizationService.instant(
      `Lifecycle::LifecycleStatus:${LifecycleStatus[status]}`
    );
  }

  getGroupStatusSeverity(status: LifecycleStatus): string {
    if (status === undefined || status === null) {
      return 'secondary';
    }
    
    if (this.statesGroupAuditTree.states.find(s => s.currentStatus.key === LifecycleFinishedStatus.Rejected)) {
      return 'danger'; // Red
    }
    switch (status) {
      case LifecycleStatus.New:
        return 'info'; // Blue
      case LifecycleStatus.Enroute:
        return 'warning'; // Yellow
      case LifecycleStatus.Complete:
        return 'success'; // Green
      case LifecycleStatus.Canceled:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getActorStatusValue(actor: StateActorAuditDto) {
    if (actor.status === undefined || actor.status === null) {
      return this.localizationService.instant('Lifecycle::LifecycleActorStatus:Unknown');
    }
    if (this.statesGroupAuditTree.currentState.status === LifecycleStatus.Canceled && actor.status !== LifecycleActorStatus.Canceled) {
      return this.localizationService.instant('Lifecycle::LifecycleActorStatus:Skipped');
    }
    return this.localizationService.instant(
      `Lifecycle::LifecycleActorStatus:${LifecycleActorStatus[actor.status]}`
    );
  }

  getActorStatusSeverity(actor: StateActorAuditDto): string {
    if (actor.status === undefined || actor.status === null) {
      return 'secondary';
    }

    switch (actor.status) {
      case LifecycleActorStatus.Rejected:
        return 'danger'; // Red
      case LifecycleActorStatus.Enroute:
        return 'warning'; // Yellow
      case LifecycleActorStatus.Approved:
        return 'success'; // Green
      case LifecycleActorStatus.Reviewed:
        return 'info'; // Blue
      case LifecycleActorStatus.Canceled:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getActorStatusText(status: LifecycleActorStatus, statusDate: string) {
    switch (status) {
      case LifecycleActorStatus.Approved:
        return this.localizationService.instant('Lifecycle::States:Actors:Approved', statusDate);
      case LifecycleActorStatus.Rejected:
        return this.localizationService.instant('Lifecycle::States:Actors:Rejected', statusDate);
      case LifecycleActorStatus.Enroute:
        return this.localizationService.instant('Lifecycle::States:Actors:Enroute');
      case LifecycleActorStatus.Reviewed:
        return this.localizationService.instant('Lifecycle::States:Actors:Reviewed', statusDate);
      case LifecycleActorStatus.Canceled:
        return this.localizationService.instant('Lifecycle::States:Actors:Cancelled', statusDate);
      default:
        return '';
    }
  }

  getStatusAuditText(status: LifecycleStatus, statusDate: string, displayName: string): string {
    if (!statusDate) {
      const lastActor = this.statesGroupAuditTree.currentState.actors.sort((a,b) => b.orderIndex - a.orderIndex)[0];
      statusDate = lastActor?.statusDate;
      displayName = lastActor?.displayName;
    }
    
    const formattedDate = this.datePipe.transform(statusDate, "M/d/yy, H:mm") || statusDate;
    switch (status) {
      case LifecycleStatus.New:
        return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:New',
          formattedDate
        );
      case LifecycleStatus.Enroute:
         if (this.statesGroupAuditTree.states.find(s => s.actors.find(a =>  [LifecycleActorStatus.Rejected,LifecycleActorStatus.Rejected, LifecycleActorStatus.Approved].includes(a.status)))) {
          return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:UpdatedAt',
          formattedDate,
          displayName
        );
        }
        return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:Enroute',
          formattedDate
        );
      case LifecycleStatus.Complete:
        return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:Complete',
          formattedDate,
          displayName
        );
      case LifecycleStatus.Canceled:
        return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:Canceled',
          formattedDate,
          displayName
        );
      default:
        return this.localizationService.instant(
          'Lifecycle::StatesGroup:Audit:UpdatedAt',
          formattedDate,
          displayName
        );
    }
  }

  get docId (){
    if (this.mode === TraceCardMode.Template) {
      return '';
    } else if (this.statesGroupAuditTree?.extraProperties) {
      return this.statesGroupAuditTree.extraProperties['DocEntry'] || '';
    }
  }
}
