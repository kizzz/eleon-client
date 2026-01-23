import { Component, OnInit } from "@angular/core";
import { ControlDelegationDto } from '@eleon/control-delegation-proxy';
import { ControlDelegationService } from '@eleon/control-delegation-proxy';
import { TableLazyLoadEvent } from "primeng/table";
import { Observable, finalize, map, of } from "rxjs";
import { LocalizedMessageService } from "@eleon/primeng-ui.lib";
import {
  ControlDelegationRowValidators,
  ControlDelegationTableRow,
} from "../control-delegation-list/control-delegation-list.component";
import {
  ValidationRuleSet,
  ValidationService,
  validationRule,
} from "@eleon/primeng-ui.lib";
import { CommonUserDto } from '@eleon/angular-sdk.lib';

const RowValidationRules: ValidationRuleSet<
  ControlDelegationTableRow,
  ControlDelegationRowValidators
> = {
  user: validationRule(
    (x) => !!x.user || !!x.data.delegatedToUserId,
    "TenantManagement::ControlDelegation:Error:UserIsRequired"
  ),
  delegationStartDate: validationRule(
    (x) => !!x.data.delegationStartDate?.length,
    "TenantManagement::ControlDelegation:Error:StartDateIsRequired"
  ),
};

@Component({
  standalone: false,
  selector: "app-control-delegation-by-user",
  templateUrl: "./control-delegation-by-user.component.html",
  styleUrls: ["./control-delegation-by-user.component.scss"],
})
export class ControlDelegationByUserComponent implements OnInit {
  loading = false;
  activeDelegations: ControlDelegationDto[] = [];
  showUserSelectionDialog: boolean = false;
  searchQueryText: string;

  constructor(
    private controlDelegationService: ControlDelegationService,
    private msgService: LocalizedMessageService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadActiveDelegations();
  }

  public disableDelegation = (
    delegation: ControlDelegationTableRow
  ): Observable<boolean> => {
    this.loading = true;
    return this.controlDelegationService
      .setControlDelegationActiveStateByDelegationIdAndIsActive(
        delegation.data.id,
        false
      )
      .pipe(finalize(() => (this.loading = false)))
      .pipe(
        map((result) => {
          if (!result) {
            return false;
          }

          this.activeDelegations = this.activeDelegations.filter(
            (x) => x !== delegation.data
          );

          return true;
        })
      );
  };

  public onDelegationAdded(): void {
    this.loadActiveDelegations();
  }

  public updateDelegation = (
    delegation: ControlDelegationTableRow
  ): Observable<boolean> => {
    if (!this.validate(delegation)) {
      return of(false);
    }

    return this.controlDelegationService
      .updateControlDelegationByRequest({
        delegationId: delegation.data.id,
        fromDate: delegation.data.delegationStartDate,
        toDate: delegation.data.delegationEndDate,
        reason: delegation.data.reason,
      })
      .pipe(
        map((result) => {
          if (!result) {
            return false;
          }

          this.msgService.success(
            "TenantManagement::ControlDelegation:DelegationUpdatedSuccessfully"
          );

          return true;
        })
      );
  };

  public addDelegation = (
    delegation: ControlDelegationTableRow
  ): Observable<boolean> => {
    if (!this.validate(delegation)) {
      return of(false);
    }
    return this.controlDelegationService
      .addControlDelegationByRequest({
        delegatedToUserId: delegation.user.id,
        delegationStartDate: delegation.data.delegationStartDate,
        delegationEndDate: delegation.data.delegationEndDate,
        reason: delegation.data.reason,
      })
      .pipe(
        map((result) => {
          if (!result) {
            return false;
          }

          this.msgService.success(
            "TenantManagement::ControlDelegation:DelegationCreatedSuccessfully"
          );
          this.onDelegationAdded();
          return true;
        })
      );
  };

  public onUserSelected(row: ControlDelegationTableRow, user: CommonUserDto) {
    row.user = user;
    row.data.delegatedToUserName = user.userName;
    row.data.delegatedToUserId = user.id;
  }

  private validate(delegation: ControlDelegationTableRow): boolean {
    return this.validationService.validate(RowValidationRules, delegation);
  }

  private loadActiveDelegations(): void {
    this.loading = true;
    this.controlDelegationService
      .getActiveControlDelegationsByUser()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.activeDelegations = res;
        if(this.searchQueryText?.length > 0){
          this.activeDelegations = this.activeDelegations.filter(x =>
            x.reason?.includes(this.searchQueryText) ||
            x.userName?.includes(this.searchQueryText) ||
            x.delegatedToUserName?.includes(this.searchQueryText)
          );
        }
      });
  }

  reload(event: string){
    this.searchQueryText = event;
    this.loadActiveDelegations();
  }
}