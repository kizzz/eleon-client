import { IApplicationConfigurationManager, IIdentitySelectionDialogService } from '@eleon/angular-sdk.lib';
import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ControlDelegationDto } from '@eleon/tenant-management-proxy';
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { TableLazyLoadEvent } from "primeng/table";
import { LocalizedConfirmationService } from "@eleon/primeng-ui.lib";
import { TableRowEditorDirective } from "@eleon/primeng-ui.lib";
import { TableAction } from "@eleon/primeng-ui.lib";
import { parseUtc } from "@eleon/angular-sdk.lib";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
export type ControlDelegationRowValidators = {
  user: boolean;
  delegationStartDate: boolean;
};

export interface ControlDelegationTableRow {
  data: ControlDelegationDto;
  user?: CommonUserDto;
  validators: ControlDelegationRowValidators;
}

@Component({
  standalone: false,
  selector: "app-control-delegation-list",
  templateUrl: "./control-delegation-list.component.html",
  styleUrls: ["./control-delegation-list.component.scss"],
})
export class ControlDelegationListComponent {
  public delegationFactory = (): ControlDelegationTableRow => ({
    data: {} as ControlDelegationDto,
    validators: {
      user: false,
      delegationStartDate: false,
    },
  });

  @Input()
  loading = false;

  @Input()
  lazy = false;

  @Input()
  totalRows = 0;

  @Input()
  showReloadButton = false;

  @Output()
  userSelected = new EventEmitter<{row: ControlDelegationTableRow, user: CommonUserDto}>();

  @Input({
    transform: (value: ControlDelegationDto[]) => {
      return value.map(
        (x) =>
          ({
            data: x,
            validators: { user: false, delegationStartDate: false },
            term: (() => {
              if (!x.delegationStartDate) return [];
              if (!x.delegationEndDate)
                return [parseUtc(x.delegationStartDate)];
              return [
                parseUtc(x.delegationStartDate),
                parseUtc(x.delegationEndDate),
              ];
            })(),
          } as ControlDelegationTableRow)
      );
    },
  })
  controlDelegations: ControlDelegationDto[] = [];

  @Input()
  userTemplate: TemplateRef<any>;

  @Input()
  rowAdded: TableAction<ControlDelegationTableRow> = "disabled";

  @Input()
  rowRemoved: TableAction<ControlDelegationTableRow> = "disabled";

  @Input()
  rowEdited: TableAction<ControlDelegationTableRow> = "disabled";

  @Input()
  showLastLogin: boolean = false;

  @Input()
  controls: TemplateRef<unknown>;

  @Output()
  lazyLoad = new EventEmitter<TableLazyLoadEvent>();

  userId: string;

  @Input()
  searchQueryText:string = null;

  @Output()
  reloadEvent = new EventEmitter<string>();

  editingSomeRow: boolean = false;
  @ViewChild('editor') rowsEditor: TableRowEditorDirective;

  constructor(
    private datePipe: DatePipe,
    private localizationService: ILocalizationService,
    public config: IApplicationConfigurationManager,
    private confirmationService: LocalizedConfirmationService,
    private userService: IIdentitySelectionDialogService
  ) {
    this.userId = this.config.getAppConfig().currentUser?.id
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.lazyLoad.emit(event);
  }

  public onUserSelected(row: ControlDelegationTableRow, user: CommonUserDto) {
    this.userSelected.emit({row, user});
  }

  public getDelegationTerm(row: ControlDelegationTableRow) {
    if (row.data.delegationEndDate?.length) {
      return `${this.datePipe.transform(
        parseUtc(row.data.delegationStartDate)
      )} - ${this.datePipe.transform(parseUtc(row.data.delegationEndDate))}`;
    }

    return this.localizationService.instant(
      "TenantManagement::ControlDelegation:DelegationTermFrom",
      this.datePipe.transform(parseUtc(row.data.delegationStartDate))
    );
  }

  userAvatarDisplay(row : ControlDelegationTableRow){
    if(!row){
      return null;
    }

    if(row.data.delegatedToUserId === this.userId){
      return row.data.userId;
    }else if(row.data.delegatedToUserId !== this.userId){
      return row.data.delegatedToUserId;
    }
    return null;
  }

  search(event, isNeedClearSearchQuery: boolean = false) {
    if(this.editingSomeRow){
      this.confirmationService.confirm('Infrastructure::ConfirmLeavingDirty',
      ()=>{
        this.editingSomeRow = false;
        this.rowsEditor.cancelEdit();
        if(isNeedClearSearchQuery) this.searchQueryText = "";
        this.reloadEvent.emit(this.searchQueryText);      
      })
    }
    else{
      this.editingSomeRow = false;
      if(isNeedClearSearchQuery) this.searchQueryText = "";
        this.reloadEvent.emit(this.searchQueryText);
      }
  }

  clear(event) {
    this.search(event, true);
  }

  tableEditing(event: boolean){
    this.editingSomeRow = event;
  }

  showUserSelectionDialog(row: ControlDelegationTableRow) {
    this.userService.openUserSelectionDialog({
      title: this.localizationService.instant('TenantManagement::ControlDelegation:SelectUser'),
      permissions: [],
      selectedUsers: [],
      isMultiple: false,
      onSelect: (users) => {
        const selectedUser = users[0];
        if (selectedUser) {
          this.onUserSelected(row, users[0]);
        }
      },
      ignoredUsers: []
    });
  }
}
