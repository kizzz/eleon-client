import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { TenantExternalLoginSettingsBoxComponent } from "../tenant-external-login-settings-box/tenant-external-login-settings-box.component";

@Component({
  standalone: false,
  selector: "app-tenant-external-login-settings-dialog",
  templateUrl: "./tenant-external-login-settings-dialog.component.html",
  styleUrls: ["./tenant-external-login-settings-dialog.component.scss"],
})
export class TenantExternalLoginSettingsDialogComponent {
  @ViewChildren(TenantExternalLoginSettingsBoxComponent)
  settingsBoxes: QueryList<TenantExternalLoginSettingsBoxComponent>;

  @Input()
  showDialog: boolean = false;

  @Output()
  showDialogChange = new EventEmitter<boolean>();

  @Input()
  tenantId: string;

  show(): void {
    this.showDialog = true;
    this.showDialogChange.emit(true);
  }

  cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
  }

  save(): void {
    this.settingsBoxes?.forEach((box) => box.save());
  }

  onSaved(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
  }
}
