import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { TooltipModule } from 'primeng/tooltip';
import { ClientApplicationDto } from '@eleon/sites-management-proxy';
import {
  getBooleanProperty,
  getStringProperty,
  setBooleanProperty,
  setStringProperty,
} from './application-properties.helper';
import { RawEditorModule } from '@eleon/primeng-ui.lib';
import {
  getDefaultPwaSetting,
  validatePwaSettingJson,
} from './pwa-settings.helper';

@Component({
  selector: 'app-pwa-settings',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    SelectModule,
    TooltipModule,
    RawEditorModule,
  ],
  template: `
    <div class="grid align-items-center">
      <div class="col-2" appRequired>
        {{ 'TenantManagement::IsPWA' | abpLocalization }}
      </div>
      <div class="col-10">
        <p-checkbox
          [binary]="true"
          [(ngModel)]="isPwaChecked"
          (onChange)="onIsPwaChanged()"
          [disabled]="loading"
          id="isPwa-input"
        >
        </p-checkbox>
      </div>
    </div>
    <div style="height:300px" *ngIf="isPwaChecked">
      <app-raw-editor
        [options]="jsonOptions"
        [darkMode]="darkMode"
        [readOnly]="readOnly"
        [loading]="loading"
        [(content)]="pwaSetting"
        (contentChange)="onPwaSettingChanged()"
      >
      </app-raw-editor>
    </div>
  `,
})
export class PwaSettingsComponent {
  @Input() node: TreeNode<ClientApplicationDto>;
  isPwaChecked = false;
  pwaSetting: string;
  loading = false;

  jsonOptions = {
    language: 'json',
    readonly: false,
    automaticLayout: true,
  };
  darkMode: boolean = true;
  height: string = '40rem';
  readOnly: boolean = false;
  showToolbar: boolean = true;
  ngOnInit(): void {
    this.isPwaChecked = getBooleanProperty(this.node.data, 'IsPwa');
    this.pwaSetting = getStringProperty(this.node.data, 'PwaManifest');

    if (!this.pwaSetting?.length) {
      this.pwaSetting = getDefaultPwaSetting(
        this.node.data.name,
        '/apps/' + (this.node.data.path ?? '')
      );
      setStringProperty(this.node.data, 'PwaManifest', this.pwaSetting);
    }
  }

  onIsPwaChanged(): void {
    setBooleanProperty(this.node.data, 'IsPwa', this.isPwaChecked);
  }

  onPwaSettingChanged() {
    setStringProperty(this.node.data, 'PwaManifest', this.pwaSetting);
  }

  validate(): { valid: boolean; errors: string[] } {
    return validatePwaSettingJson(this.pwaSetting);
  }
}
