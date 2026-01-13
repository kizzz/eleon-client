import { DialogService } from 'primeng/dynamicdialog';
import { state } from '@angular/animations';
import { Injectable } from '@angular/core';
import {
  ILocalizationService,
  PagedResultDto,
  ILifecycleService,
  StatesGroupAuditPendingApprovalDto,
} from '@eleon/angular-sdk.lib';
import {
  LifecycleStatusDto,
  GetStatesGroupsDto,
  FullStatesGroupTemplateDto,
  LifecycleManagerService,
  StateActorAuditService,
  StateActorTemplateService,
  StatesGroupAuditService,
  StatesGroupTemplateService,
  StateTemplateService,
  PendingApprovalRequestDto,
  StateActorTemplateDto,
  StatesGroupAuditTreeDto,
  StatesGroupSwitchDto,
  StatesGroupTemplateDto,
  StateSwitchDto,
  StateTemplateDto,
  UpdateApprovalTypeDto,
} from '@eleon/lifecycle-feature-proxy';
import { Observable } from 'rxjs';
import {
  LifecycleTraceCardComponent,
  TraceCardMode,
} from '../lifecycle/lifecycle';

@Injectable({ providedIn: 'root' })
export class LifecycleService extends ILifecycleService {
  constructor(
    private statesGroupAuditService: StatesGroupAuditService,
    private statesGroupTemplateService: StatesGroupTemplateService,
    private dialogService: DialogService,
    private localizationService: ILocalizationService,
    private stateTemplateService: StateTemplateService,
    private stateActorAuditService: StateActorAuditService,
    private lifecycleManagerService: LifecycleManagerService,
    private stateActorTemplateService: StateActorTemplateService // another required proxy services
  ) {
    super();
  }
  reject(
    documentObjectType: string,
    documentId: string,
    reason: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.lifecycleManagerService.rejectByDocumentObjectTypeAndDocumentIdAndReason(
      documentObjectType,
      documentId,
      reason,
      config
    );
  }
  approve(
    documentObjectType: string,
    documentId: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.lifecycleManagerService.approveByDocumentObjectTypeAndDocumentId(
      documentObjectType,
      documentId,
      config
    );
  }
  canApprove(
    documentObjectType: string,
    DocId: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.lifecycleManagerService.canApproveByDocumentObjectTypeAndDocId(
      documentObjectType,
      DocId,
      config
    );
  }
  getLifecycleStatus(
    documentObjectType: string,
    documentId: string,
    config?: Partial<any>
  ): Observable<LifecycleStatusDto> {
    return this.lifecycleManagerService.getLifecycleStatusByDocumentObjectTypeAndDocumentId(
      documentObjectType,
      documentId,
      config
    );
  }
  getTrace(
    documentObjectType: string,
    DocId: string,
    config?: Partial<any>
  ): Observable<StatesGroupAuditTreeDto> {
    return this.lifecycleManagerService.getTraceByDocumentObjectTypeAndDocId(
      documentObjectType,
      DocId,
      config
    );
  }
  getPendingApproval(
    input: PendingApprovalRequestDto,
    config?: Partial<any>
  ): Observable<PagedResultDto<StatesGroupAuditPendingApprovalDto>> {
    return this.statesGroupAuditService.getReportsByInput(
      input,
      config
    );
  }
  updateByStateActorTemplate(
    stateActorTemplate: StateActorTemplateDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorTemplateService.updateByStateActorTemplate(
      stateActorTemplate,
      config
    );
  }
  addByStateActorTemplate(
    stateActorTemplate: StateActorTemplateDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorTemplateService.addByStateActorTemplate(
      stateActorTemplate,
      config
    );
  }
  addByStatesGroupTemplate(
    statesGroupTemplate: StatesGroupTemplateDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.statesGroupTemplateService.addByStatesGroupTemplate(
      statesGroupTemplate,
      config
    );
  }
  getList(
    input: GetStatesGroupsDto,
    config?: Partial<any>
  ): Observable<PagedResultDto<StatesGroupTemplateDto>> {
    return this.statesGroupTemplateService.getList(input, config);
  }
  updateByStatesGroupTemplate(
    statesGroupTemplate: StatesGroupTemplateDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.statesGroupTemplateService.updateByStatesGroupTemplate(
      statesGroupTemplate,
      config
    );
  }
  updateNameByIdAndName(
    id: string,
    name: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.updateNameByIdAndName(id, name, config);
  }
  updateApprovalTypeByUpdate(
    update: UpdateApprovalTypeDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.updateApprovalTypeByUpdate(update, config);
  }
  addByStateTemplate(
    stateTemplate: StateTemplateDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.addByStateTemplate(stateTemplate, config);
  }
  removeByGroupIdAndStateId(
    groupId: string,
    stateId: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.removeByGroupIdAndStateId(
      groupId,
      stateId,
      config
    );
  }

  removeStateActorAuditById(
    id: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorAuditService.removeById(id, config);
  }
  removeStateAuditById(id: string, config?: Partial<any>): Observable<boolean> {
    return this.stateActorAuditService.removeById(id, config);
  }
  removeStatesGroupAuditById(
    id: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.statesGroupAuditService.removeById(id, config);
  }
  removeStateActorTemplateById(
    id: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorTemplateService.removeById(id, config);
  }
  removeStatesGroupTemplateById(
    id: string,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.statesGroupTemplateService.removeById(id, config);
  }
  updateStateActorTemplateOrderIndexes(
    order: Record<string, number>,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorTemplateService.updateOrderIndexesByOrder(
      order,
      config
    );
  }
  updateStateTemplateOrderIndexes(
    order: Record<string, number>,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.updateOrderIndexesByOrder(order, config);
  }
  getAllStateActorTemplates(
    stateId: string,
    config?: Partial<any>
  ): Observable<StateActorTemplateDto[]> {
    return this.stateActorTemplateService.getAll(stateId, config);
  }
  getAllStateTemplates(
    stateId: string,
    config?: Partial<any>
  ): Observable<StateTemplateDto[]> {
    return this.stateTemplateService.getAll(stateId, config);
  }
  enableStateActorTemplate(
    stateSwitchDto: StateSwitchDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateActorTemplateService.enableByStateSwitchDto(
      stateSwitchDto,
      config
    );
  }

  enableStateTemplate(
    input: StateSwitchDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.stateTemplateService.enableByInput(input, config);
  }
  enableStatesGroupTemplate(
    groupEnableDto: StatesGroupSwitchDto,
    config?: Partial<any>
  ): Observable<boolean> {
    return this.statesGroupTemplateService.enableByGroupEnableDto(
      groupEnableDto,
      config
    );
  }

  openTraceTemplate(fullStatesGroupTemplate: FullStatesGroupTemplateDto): void {
    this.dialogService.open(LifecycleTraceCardComponent, {
      width: '720px',
      header: this.localizationService.instant('Lifecycle::TraceCard:TemplateTitle'),
      data: {
        fullStatesGroupTemplate: fullStatesGroupTemplate,
        mode: TraceCardMode.Template,
      },
    });
  }

  openHistoryTrace(statesGroupAuditTree: StatesGroupAuditTreeDto): void {
    this.dialogService.open(LifecycleTraceCardComponent, {
      width: '720px',
      header: this.localizationService.instant('Lifecycle::TraceCard:HistoryTitle'),
      data: {
        statesGroupAuditTree: statesGroupAuditTree,
        mode: TraceCardMode.History,
      },
    });
  }

  getStateGroupTemplate(
    id: string,
    config?: Partial<any>
  ): Observable<FullStatesGroupTemplateDto> {
    return this.statesGroupTemplateService.get(id, config);
  }
}
