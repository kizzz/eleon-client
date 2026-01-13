import { ILocalizationService } from '@eleon/angular-sdk.lib';

import { IdentityUserDto, IdentityRoleDto } from '@eleon/tenant-management-proxy';
import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnInit,
  Output
} from "@angular/core"
import { LocalizedConfirmationService, LocalizedMessageService } from "@eleon/primeng-ui.lib"
import { PageStateService } from "@eleon/primeng-ui.lib"

@Injectable({
  providedIn: "root",
})
@Component({
  standalone: false,
  selector: "app-user-session-management",
  templateUrl: "./user-session-management.component.html",
  styleUrls: ["./user-session-management.component.scss"],
  exportAs: "sessionManagement",
})
export class UserSessionManagementComponent implements OnInit {
  protected _visible = false;

@Input()
  entityDisplayName: string | undefined;

  @Input()
  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    if (value === this._visible) return;

    if (value) {
      this._visible = true;
      this.visibleChange.emit(true);
    } else {
      this._visible = false;
      this.visibleChange.emit(false);
    }
  }

  @Output() readonly visibleChange = new EventEmitter<boolean>();

  user: IdentityUserDto
  

  constructor(
    protected localizationService: ILocalizationService,
    protected pageStateService: PageStateService,
    protected confirmationService: LocalizedConfirmationService,
    protected msgService: LocalizedMessageService,
  ) {}
  ngOnInit(): void {
    
  }

  public show(user: IdentityUserDto) {
    this.entityDisplayName = user.name?.length
      ? user.name + (user.surname?.length ? " " + user.surname : "")
      : user.userName;
    this.user = user;
    this.visible = true;
  }

  closeDialog() {
    if (this.pageStateService.isDirty) {
      this.confirmationService.confirm(
        "Infrastructure::ConfirmLeavingDirty",
        () => {
          this.pageStateService.setNotDirty();
          this._visible = false;
        }
      );
    } else {
      this._visible = false;
    }
  }
}