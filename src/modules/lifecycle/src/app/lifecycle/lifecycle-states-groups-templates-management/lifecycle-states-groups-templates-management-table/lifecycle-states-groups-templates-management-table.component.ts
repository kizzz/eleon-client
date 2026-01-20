import { ILocalizationService, IPermissionService, StatesGroupTemplateDto } from '@eleon/angular-sdk.lib';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { Subscription, firstValueFrom } from "rxjs";
import { ConfirmationService, MessageService } from 'primeng/api';
import { StatesGroupTemplateService } from '@eleon/lifecycle-feature-proxy';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { LifecycleService } from '../../lifecycle-services/lifecycle-service';

@Component({
  standalone: false,
  selector: "app-lifecycle-states-groups-templates-management-table",
  templateUrl:
    "./lifecycle-states-groups-templates-management-table.component.html",
  styleUrls: [
    "./lifecycle-states-groups-templates-management-table.component.scss",
  ],
})

export class LifecycleStatesGroupsTemplatesManagementTableComponent
  implements OnInit, OnDestroy
{
  @ViewChild("statesGroupTable") statesTable: Table;

  rowsCount: number = 10;
  totalRecords: number = 0;
  rows: StatesGroupTemplateDto[];
  loading: boolean = false;
  groupName: string;
  defaultSelection: boolean = true;
  editingRow: StatesGroupTemplateDto = null;
  editingRowBackup: StatesGroupTemplateDto = null;

  @Output()
  groupSelection: EventEmitter<StatesGroupTemplateDto> =
    new EventEmitter<StatesGroupTemplateDto>();
  @Output()
  groupEditEvent: EventEmitter<StatesGroupTemplateDto> =
    new EventEmitter<StatesGroupTemplateDto>();
  @Output()
  groupSavedEvent: EventEmitter<StatesGroupTemplateDto> =
    new EventEmitter<StatesGroupTemplateDto>();
  selectedStatesGroup: StatesGroupTemplateDto;
  subscriptions: Subscription[]=[];

  constructor(
    public stateGroupTemplateService: StatesGroupTemplateService,
    public localizationService: ILocalizationService,
    public confirmationService: ConfirmationService,
    private msgService: MessageService,
    public pageStateService: PageStateService,
    private elementRef: ElementRef,
    public lifecycleService: LifecycleService,
    private cdr: ChangeDetectorRef,
		private permissionService: IPermissionService,
    private router: Router,
  ) {

    const subscription = this.lifecycleService.addWorkFlowRowClicked$.subscribe((value) => {
      if (value) {
        this.addWorkFlow();
      }
    });
    this.subscriptions.push(subscription);
  }
	
	isLifecycleManager(){
		return true ; // TODO: Return permissions check // this.permissionService.getGrantedPolicy('LifecycleFeatureModule.LifecycleManager');
	}

  ngOnDestroy(): void {
    this.lifecycleService.setIsEditing(false);
    for (const subscr of this.subscriptions) {
      subscr.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loadStatesGroup({
      first: 0,
    });
  }

  // expandRow(row, event){
  //   //this.statesTable.toggleRow(row, event);
  //   this.expandedRowKeys[row.id]= !this.expandedRowKeys[row.id];
  //   this.cdr.detectChanges();
  // }

  expandRow(state, event, editing: boolean){
		if (editing) {
			this.statesTable.expandedRowKeys[state.id] = false;
		}
		else{
			this.statesTable.expandedRowKeys[state.id]= !this.statesTable.expandedRowKeys[state.id];
		}
    this.cdr.detectChanges();
  }

  addStateRow(group): void {
    this.selectedStatesGroup = group;
    if(!this.statesTable.expandedRowKeys[group.id]){
      this.statesTable.expandedRowKeys[group.id] = true;
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.lifecycleService.addStateRowClicked(group.id);
    }, 200);
  }

  editState(row: StatesGroupTemplateDto): void {
    if (this.editingRow) {
      this.msgService.add({
        severity: "error",
        summary: this.localizationService.instant('Lifecycle::StateGroups:StateGroupAlreadyInEditMode'),
      });
      return;
    }

    this.statesTable.initRowEdit(row);
    this.editingRow = row;
    this.editingRowBackup = { ...row };
    this.pageStateService.setDirty();
  }

  async saveEditedState(data: StatesGroupTemplateDto, row: any) {
    if (!this.editingRow.groupName?.length) {
      this.error("Lifecycle::StatesGroup:Name:Empty");
      return;
    }

    this.loading = true;
		

    if (this.editingRow.id) {
      await firstValueFrom(
        this.stateGroupTemplateService.updateByStatesGroupTemplate({
          id: this.editingRow.id,
          groupName: this.editingRow.groupName,
          isActive: this.editingRow.isActive,
        })
      );
    } else {
      const added = await firstValueFrom(
        this.stateGroupTemplateService.addByStatesGroupTemplate({
          groupName: this.editingRow.groupName,
          //organizationUnitsSelectAll: true,
          isActive: data.isActive,
        })
      );

      if (added) {
        this.success("Lifecycle::StatesGroup:Added");
      } else {
        this.error("Lifecycle::StatesGroup:Error");
      }

			this.enable(data);

      this.loadStatesGroup(null);
    }

    this.editingRow = null;
    this.statesTable.saveRowEdit(data, row);
    this.groupSavedEvent.emit(data);
    this.loading = false;
    this.pageStateService.setNotDirty();
  }

  addWorkFlow(): void {
    if (this.editingRow) {
      this.error(
        "Lifecycle::StateGroups:StateGroupAlreadyInEditMode"
      );
      return;
    }
    const newRow: StatesGroupTemplateDto = {
      groupName: "",
      //organizationUnitsSelectAll: true,
      isActive: true,
    };
    this.rows = [newRow, ...this.rows];
		this.totalRecords += 1;

    this.editState(newRow);
  }

  cancelStateEditing(row: StatesGroupTemplateDto) {
    if (row.id) {
      const ix = this.rows.indexOf(this.editingRow);
      this.rows[ix] = this.editingRowBackup;
      this.statesTable.cancelRowEdit(row);
    } else {
      this.rows = this.rows.filter((r) => r !== row);
    }

		this.totalRecords -= 1;
    this.editingRow = null;
    this.pageStateService.setNotDirty();
  }

	lastLoad: { first }
  loadStatesGroup(input: { first }) {
		if (input){
			this.lastLoad = input;
		}
		if (!this.lastLoad){
			this.lastLoad = { first: 0 };
		}
    this.loading = true;
    this.stateGroupTemplateService
      .getList({
        maxResultCount: this.rowsCount,
        skipCount: this.lastLoad.first,
        sorting: "creationTime",
      })
      .subscribe((rows) => {
        this.rows = rows.items;
        this.totalRecords = rows.totalCount;
        this.loading = false;
        if (this.defaultSelection && this.rows?.length) {
          this.groupSelection.emit(this.rows?.[0]);
        }
        this.defaultSelection = false;
      });
  }

  add(event) {
    this.stateGroupTemplateService
      .addByStatesGroupTemplate({
        groupName: this.groupName,
        //organizationUnitsSelectAll: true,
        isActive: true,
      })
      .subscribe((result) => {
        if (!result) {
          this.error("Lifecycle::StatesGroup:Error");
          return;
        }
        this.success("Lifecycle::StatesGroup:Added");
        this.groupName = "";
        this.loadStatesGroup({ first: 0 });
      });
  }

  removeState(event) {
    this.confirmationService.confirm({
      message: this.localizationService.instant("Lifecycle::DeleteGroupWarning", event.groupName),
      accept: () => {
        this.stateGroupTemplateService
        .removeById(event.id)
        .subscribe((result) => {
          if (!result) {
            this.error("Lifecycle::StatesGroup:Error");
            return;
          }
          this.success("Lifecycle::StatesGroup:Removed");
          this.loadStatesGroup(null);
        });
      },
      reject: ()=>{
        [event.groupName];
      },
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
    })
  }
  
  select(event) {
    if (this.editingRow) {
      return;
    }
    this.groupSelection.emit(event.data);
  }

  selectRow(event) {
    if (this.editingRow) {
      return;
    }
    this.groupSelection.emit(event);
  }


  edit(event) {
    this.selectedStatesGroup = event;
    this.groupSelection.emit( this.selectedStatesGroup);
  }

  enable(event: StatesGroupTemplateDto) {
    this.stateGroupTemplateService.enableByGroupEnableDto({
        id: event.id,
        newState: event.isActive,
      })
      .subscribe((result) => {
        this.loadStatesGroup(null);
      });
  }

  getDefaultLocalization(stategroup) {
    if (!stategroup) return "";
    if (stategroup.isDefault) {
      return this.localizationService.instant("Lifecycle::Default");
    } else {
      return this.localizationService.instant("Lifecycle::SetDefault");
    }
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

  navigateToDashboard(stategroup: StatesGroupTemplateDto, event: Event): void {
    // Prevent navigation if clicking on buttons or interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || 
        target.closest('.p-inputswitch') || 
        target.closest('input') || 
        target.closest('i.fa-chevron-right') || 
        target.closest('i.fa-chevron-down') ||
        target.closest('i.fa-plus') ||
        target.closest('i.fa-edit') ||
        target.closest('i.fa-trash') ||
        target.closest('i.fa-check') ||
        target.closest('i.fa-ban') ||
        target.closest('.row-buttons') ||
        target.closest('.pointer')) {
      return;
    }
    
    if (stategroup?.id) {
      this.router.navigate(['/lifecycle/reports'], {
        queryParams: { statesGroupTemplateId: stategroup.id }
      });
    }
  }
}
