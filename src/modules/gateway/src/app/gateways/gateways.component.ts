import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { ConfirmationService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { GatewayManagementService } from '@eleon/gateway-management-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { GatewayAngularService } from './gateway.service';
import { PageStateService } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-gateways',
  templateUrl: './gateways.component.html',
  styleUrls: ['./gateways.component.scss']
})
export class GatewaysComponent implements OnInit {
  editedId: string = undefined;
  mode: 'editing' | 'list';
  refreshId: string;
  loading: boolean = false;
  editMode: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public gatewayService: GatewayManagementService,
    public messageService: LocalizedMessageService,
    public confirmationService: ConfirmationService,
    private gatewayAngularService: GatewayAngularService,
    public state: PageStateService,
  ) { }

  ngOnInit(): void {
    this.mode = 'list';
  }

  onEdit(id: string) {
    this.editedId = id;
    this.mode = 'editing';
  }

  onCreate() {
    this.editedId = 'new';
    this.mode = 'editing';
  }

  onSave() {
    this.refreshId = Date.now().toString();
    this.editMode = false;
  }

  onBack() {
    this.mode = 'list';
    this.cancelEditing();
  }

  deleteGateway(id){
    this.confirmationService.confirm({
      message: this.localizationService.instant(
        "GatewayManagement::Gateway:ConfirmDelete"
      ),
      accept: () => {
        this.loading = true;
        this.gatewayService
          .removeGatewayByGatewayId(id)
          .subscribe((reply) => {
            this.loading = false;
            if(reply){
              this.localizationService.instant("GatewayManagement::RemoveGateway:Success");
              this.edit(false);
              this.state.setNotDirty();
              this.mode = "list";
            }
            else{
              this.localizationService.instant("GatewayManagement::RemoveGateway:Error");
            }
          });
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
    });
  }

  edit(value: boolean){
    if(value){
      this.state.setDirty();
    }
    this.editMode = value;
    this.gatewayAngularService.setEditModeClicked(value);
  }

  cancelEditing(isButtonClicked: boolean = false){
    if(isButtonClicked){
      this.confirmationService.confirm({
        message: this.localizationService.instant('Infrastructure::ConfirmLeavingDirty'),
        accept: () => {
          this.state.setNotDirty();
          this.editMode = false;
          this.gatewayAngularService.setCancelEditModeClicked(true);
          this.gatewayAngularService.setEditModeClicked(this.editMode);
        },
        reject: () => {
        },
        acceptLabel: this.localizationService.instant('Infrastructure::Yes'),
        rejectLabel: this.localizationService.instant('Infrastructure::No'),
      });
    } else{
      this.state.setNotDirty();
      this.editMode = false;
      this.gatewayAngularService.setCancelEditModeClicked(true);
      this.gatewayAngularService.setEditModeClicked(this.editMode);
    }
  }

  saveGateway(){
    this.gatewayAngularService.saveClicked(true);
    this.cancelEditing();
  }
}
