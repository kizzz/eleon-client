import { Component, OnInit } from "@angular/core";
import { IImpersonationService } from '@eleon/angular-sdk.lib'
import { ControlDelegationDto } from '@eleon/control-delegation-proxy';
import { ControlDelegationService } from '@eleon/control-delegation-proxy';
import { TableLazyLoadEvent } from "primeng/table";
import { finalize } from "rxjs";

@Component({
  standalone: false,
  selector: "app-control-delegation-to-user",
  templateUrl: "./control-delegation-to-user.component.html",
  styleUrls: ["./control-delegation-to-user.component.scss"],
})
export class ControlDelegationToUserComponent implements OnInit {
  public loading = false;
  public activeDelegations: ControlDelegationDto[] = [];
  searchQueryText: string;
  
  constructor(
    private controlDelegationService: ControlDelegationService,
    private impersonationService: IImpersonationService
  ) {}

  ngOnInit(): void {
    this.loadActiveDelegations();
  }

  public impersonate(row: any): void {
    this.impersonationService.impersonate(row.data.userId);
  }

  private loadActiveDelegations() {
    this.loading = true;
    this.controlDelegationService
      .getActiveControlDelegationsToUser()
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
