import { ILocalizationService, IPermissionService, LifecycleApprovalType, StatesGroupTemplateDto, StateTemplateDto } from "@eleon/angular-sdk.lib";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Query,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription, first, firstValueFrom } from 'rxjs';
import { LifecycleStateActorsTemplatesManagementComponent } from '../lifecycle-state-actors-templates-management/lifecycle-state-actors-templates-management.component';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LifecycleService } from '../lifecycle-services/lifecycle-service';

import { MessageService } from 'primeng/api';
import { StateTemplateService } from "@eleon/lifecycle-feature-proxy";

export interface ApprovalTypeOption {
  name: string;
  value: LifecycleApprovalType;
}

@Component({
  standalone: false,
  selector: 'app-lifecycle-states-templates-management',
  templateUrl: './lifecycle-states-templates-management.component.html',
  styleUrls: ['./lifecycle-states-templates-management.component.scss'],
})
 export class LifecycleStatesTemplatesManagementComponent implements OnInit, OnDestroy  {
  @ViewChild('statesTable') statesTable: Table;
  @ViewChildren(LifecycleStateActorsTemplatesManagementComponent) actorsLists = new QueryList<LifecycleStateActorsTemplatesManagementComponent>();

  approvalTypes: ApprovalTypeOption[];
  totalRecords: number = 0;
  rows: StateTemplateDto[] = [];
  loading: boolean = false;
  stateName: string;
  editingRow: StateTemplateDto = null;
  expandedRowKeys: any = {};
  statesLoaded: boolean = false;
  @Input() statesGroup: StatesGroupTemplateDto;

	isLifecycleManager(){
		return true; // TODO: add permissions check //this.permissionService.getGrantedPolicy('LifecycleFeatureModule.LifecycleManager');
	}

  addRowOnStartUp: boolean = false;
  subscriptions: Subscription[]=[];
  constructor(
    public stateTemplateService: StateTemplateService,
    public pageStateService: PageStateService,
    public localizationService: ILocalizationService,
    public msgService: MessageService,
    private cdr: ChangeDetectorRef,
    public lifecycleService: LifecycleService,
		private permissionService: IPermissionService,
  ) {}

  ngOnInit(): void {
    this.approvalTypes = [
      {
        name: this.localizationService.instant('Lifecycle::ApprovalType:Regular'),
        value: LifecycleApprovalType.Regular,
      },
      {
        name: this.localizationService.instant('Lifecycle::ApprovalType:Parallel'),
        value: LifecycleApprovalType.Parallel,
      },
      {
        name: this.localizationService.instant('Lifecycle::ApprovalType:AtLeast'),
        value: LifecycleApprovalType.AtLeast,
      },
    ];
    this.loadStates();

    const subscr = this.lifecycleService.addStateRowClicked$.subscribe((groupId) => {
      if (groupId === this.statesGroup.id) {
        if (this.statesLoaded) {
          this.addState();
          this.lifecycleService.addStateRowClicked(null);
        } else {
          this.addRowOnStartUp = true;
        }
      }
    });
    this.subscriptions.push(subscr);
  }

  ngOnDestroy(): void {
    this.resetComponent();
    this.lifecycleService.setIsEditing(false);
    for (const subscr of this.subscriptions) {
      subscr.unsubscribe();
    }
  }

  resetComponent(){
    this.approvalTypes = [];
    this.totalRecords = 0;
    this.rows = [];
    this.loading = false;
    this.stateName = null;
    this.editingRow = null;
    this.expandedRowKeys = {};
    this.statesLoaded = false;
    this.addRowOnStartUp = false;
    this.statesTable = {} as  Table;
    this.actorsLists = new QueryList<LifecycleStateActorsTemplatesManagementComponent>();
  }

  addActor(row: StateTemplateDto): void {
    if(!row.id?.length){
      this.error('Lifecycle::States:StateNotSaved');
      return;
    }
    for (const key in this.expandedRowKeys) {
      if (Object.prototype.hasOwnProperty.call(this.expandedRowKeys, key)) {
        this.expandedRowKeys[key] = false;
      }
    }

    this.expandedRowKeys[row.id] = true;
    setTimeout(() => {
      this.actorsLists.toArray()[0]?.addActor();
    }, 200);
  }

  async saveEditedState(data: StateTemplateDto, row: any) {
    let added = false;
    if (!data.stateName?.length) {
      this.error('Lifecycle::States:Name:Empty');
      return;
    }
    this.loading = true;

    if (this.editingRow.id) {
      await Promise.all([
        firstValueFrom(
          this.stateTemplateService.updateNameByIdAndName(
            this.editingRow.id,
            this.editingRow.stateName
          )
        ),
        firstValueFrom(
          this.stateTemplateService.enableByInput({
            id: this.editingRow.id,
            newState: this.editingRow.isActive,
          })
        ),
        firstValueFrom(
          this.stateTemplateService.updateApprovalTypeByUpdate({
            id: this.editingRow.id,
            newApprovalType: this.editingRow.approvalType,
          })
        ),
      ]);
    } else {
      added = await firstValueFrom(
        this.stateTemplateService.addByStateTemplate({
          stateName: this.editingRow.stateName,
          isActive: this.editingRow.isActive,
          isReadOnly: this.editingRow.isReadOnly,
          isMandatory: this.editingRow.isMandatory,
          orderIndex: this.rows.length,
          approvalType: this.editingRow.approvalType,
          statesGroupTemplateId: this.statesGroup.id,
        })
      );

      if (added) {
        this.success('Lifecycle::States:Added');
      } else {
        this.error('Lifecycle::States:Error');
      }
      this.pageStateService.setNotDirty();
      this.loadStates(added);
    }

    this.editingRow = null;
    this.lifecycleService.setIsEditing(false);
    this.statesTable.saveRowEdit(data, row);
    this.loading = false;
    this.pageStateService.setNotDirty();
  }

  enable(row) {
    
    this.stateTemplateService.enableByInput({
      id: row.id,
      newState: row.isActive,
    })
    .pipe(first())
    .subscribe(result => {
      if (result) {
        // this.msgService.success('Lifecycle::Success');
      }
    })
  }

  expandRow(state){
    this.statesTable.expandedRowKeys[state.id]= true;
  }

  collapsRow(state){
    this.statesTable.expandedRowKeys[state.id]= false;
  }

  addState(): void {
    if (this.lifecycleService.getIsEditing()) {
      this.error('Lifecycle::States:StateAlreadyInEditMode');
      return;
    }
    this.pageStateService.setDirty();
    const newRow: StateTemplateDto = {
      stateName: '',
      statesGroupTemplateId: this.statesGroup.id,
      isActive: true,
      isReadOnly: false,
      isMandatory: false,
      orderIndex: this.rows.length,
      approvalType: LifecycleApprovalType.Regular,
    };

    this.rows.push(newRow);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.editState(newRow);
    }, 100);
  }

  editState(row: StateTemplateDto): void {
    if (this.lifecycleService.getIsEditing()) {
      this.error('Lifecycle::States:StateAlreadyInEditMode');
      return;
    }

    this.statesTable.initRowEdit(row);
    this.editingRow = row;
    this.lifecycleService.setIsEditing(true);
    this.pageStateService.setDirty();
    this.cdr.detectChanges();
  }

  cancelStateEditing(row: StateTemplateDto) {
    if (row.id) {
      this.statesTable.cancelRowEdit(row);
    } else {
      this.rows = this.rows.filter(r => r !== row);
    }

    this.editingRow = null;
    this.lifecycleService.setIsEditing(false);
    this.pageStateService.setNotDirty();
    this.cdr.detectChanges();
  }

  reorder() {
    const dict: Record<string, number> = {};
    this.rows.forEach((state, index) => (dict[state.id] = index));
    this.stateTemplateService.updateOrderIndexesByOrder(dict).subscribe(_ => this.loadStates());
    this.cdr.detectChanges();
  }

  loadStates(isExpandNew: boolean = false) {
    this.loading = true;
    this.stateTemplateService.getAll(this.statesGroup.id).subscribe(states => {
      if(!isExpandNew){
        this.rows = states.sort((a, b) => a.orderIndex - b.orderIndex);
        this.totalRecords = states.length;
      }
      if(isExpandNew && states?.length > 0){
        states?.forEach(row => {
          this.statesTable.expandedRowKeys[row.id]= false;
        });
        let lastAdded = states.sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());
        this.rows[this.rows.length - 1] = lastAdded[0];
        this.statesTable.expandedRowKeys[lastAdded[0].id]= true;
      }
      this.loading = false;
      this.cdr.detectChanges();
      this.statesLoaded = true;
      if(!!this.statesGroup.id?.length &&  this.addRowOnStartUp){
        setTimeout(()=>{
          this.addState();
        }, 100)
        this.addRowOnStartUp = false;
      }
    });
  }

  removeState(row: StateTemplateDto) {
    this.stateTemplateService
      .removeByGroupIdAndStateId(this.statesGroup.id, row.id)
      .subscribe(result => {
        if (!result) {
          this.error('Lifecycle::States:Error');
        } else {
          this.success('Lifecycle::States:Removed');
          this.stateName = '';
          this.loadStates();
        }
      });
  }

  getTypeLocalization(type: LifecycleApprovalType) {
    return this.approvalTypes.find(t => t.value === type).name;
  }

  error(string){
    this.msgService.add({
      severity: "error",
      summary: this.localizationService.instant(string),
    });
  }

  success(string){
    this.msgService.add({
      severity: "success",
      summary: this.localizationService.instant(string),
    });
  }

  warn(string){
    this.msgService.add({
      severity: "warn",
      summary: this.localizationService.instant(string),
    });
  }
}
