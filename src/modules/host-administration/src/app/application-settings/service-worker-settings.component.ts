import { Component, Input } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { TooltipModule } from 'primeng/tooltip';
import { ClientApplicationDto } from '@eleon/sites-management-proxy';
import { RawEditorModule } from '@eleon/primeng-ui.lib';
import {
  getDefaultSwConfig,
  validateSwConfigJson,
} from './service-worker-settings.helper';
import {
  getBooleanProperty,
  getStringProperty,
  setBooleanProperty,
  setStringProperty,
} from './application-properties.helper';

@Component({
  selector: 'app-service-worker-settings',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    CheckboxModule,
    TooltipModule,
    TextareaModule,
    RawEditorModule,
  ],
  template: `
    <div class="grid align-items-center">
      <div class="col-4" appRequired>
        {{ 'TenantManagement::EnableServiceWorker' | abpLocalization }}
      </div>
      <div class="col-8">
        <p-checkbox
          [binary]="true"
          [(ngModel)]="isSwEnabled"
          (onChange)="onSwToggle()"
          [disabled]="loading"
          id="enable-sw-checkbox"
        >
        </p-checkbox>
      </div>
    </div>

    <div style="height:300px" *ngIf="isSwEnabled">
      <app-raw-editor
        [options]="jsonOptions"
        [darkMode]="darkMode"
        [readOnly]="readOnly"
        [loading]="loading"
        [(content)]="swConfigJson"
        (contentChange)="onSwConfigChanged()"
      >
      </app-raw-editor>
    </div>
  `,
})
export class ServiceWorkerSettingsComponent {
  @Input() node: TreeNode<ClientApplicationDto>;

  isSwEnabled = false;
  swConfigJson = '';
  loading = false;

  jsonOptions = {
    language: 'json',
    readOnly: false,
    automaticLayout: true,
  };
  darkMode = true;
  readOnly = false;

  ngOnInit(): void {
    this.isSwEnabled = getBooleanProperty(this.node.data, 'UseServiceWorker');
    this.swConfigJson = getStringProperty(
      this.node.data,
      'ServiceWorkerConfig'
    );

    if (!this.swConfigJson?.length) {
      this.swConfigJson = getDefaultSwConfig();
      setStringProperty(
        this.node.data,
        'ServiceWorkerConfig',
        this.swConfigJson
      );
    }
  }

  onSwToggle(): void {
    setBooleanProperty(this.node.data, 'UseServiceWorker', this.isSwEnabled);
  }

  onSwConfigChanged(): void {
    setStringProperty(this.node.data, 'ServiceWorkerConfig', this.swConfigJson);
  }

  validate(): { valid: boolean; errors: string[] } {
    return validateSwConfigJson(this.swConfigJson);
  }
}
