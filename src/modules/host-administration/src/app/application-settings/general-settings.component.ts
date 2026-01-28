import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    SelectModule,
    TooltipModule,
  ],
  template: `
    <div
      class="grid align-items-center"
      *ngIf="
        node.data.nodeType === 'client-module' ||
        node.data.nodeType === 'server-app'
      "
    >
      <div class="col-4 lg:col-3" appRequired>
        {{ 'TenantManagement::DisplayName' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <input
          class="w-full"
          id="name"
          type="text"
          pInputText
          [(ngModel)]="node.data.name"
          [ngClass]="{ 'ng-invalid ng-dirty': nameEmpty }"
          (input)="onResetValidators()"
        />
      </div>
    </div>
    <div class="grid align-items-center">
      <div class="col-4  lg:col-3" appRequired>
        {{ 'TenantManagement::Name' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <input
          class="w-full"
          id="name"
          type="text"
          pInputText
          [(ngModel)]="node.data.name"
          [ngClass]="{ 'ng-invalid ng-dirty': nameEmpty }"
          (input)="onResetValidators()"
        />
      </div>
    </div>
    <div
      class="grid align-items-center"
      *ngIf="
        node.data.nodeType === 'client-module' ||
        node.data.nodeType === 'client-app' ||
        node.data.nodeType === 'server-app'
      "
    >
      <div class="col-4  lg:col-3" appRequired>
        {{ 'TenantManagement::Path' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <div
          class="p-inputgroup"
          [ngClass]="{ 'ng-invalid ng-dirty invalid': pathEmpty }"
        >
          <span
            class="p-inputgroup-addon small"
            [pTooltip]="tooltip"
            tooltipPosition="top"
            >/apps/</span
          >
          <input
            class="w-full"
            id="name"
            type="text"
            pInputText
            [(ngModel)]="node.data.path"
            (input)="onResetValidators()"
          />
        </div>
      </div>
    </div>
    <div
      class="grid align-items-center"
      *ngIf="
        node.data.nodeType === 'client-app' && node.data.frameworkType === 0
      "
    >
      <div class="col-4  lg:col-3">
        {{ 'TenantManagement::Source' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <div class="p-inputgroup">
          <input
            class="w-full"
            id="name"
            type="text"
            pInputText
            [(ngModel)]="node.data.source"
          />
        </div>
      </div>
    </div>
    <div
      class="grid align-items-center"
      *ngIf="node.data.nodeType === 'client-app'"
    >
      <div class="col-4  lg:col-3">
        {{ 'TenantManagement::Application:IsDefault' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <div class="p-inputgroup">
          <p-checkbox
            [binary]="true"
            [(ngModel)]="node.data.isDefault"
          ></p-checkbox>
        </div>
      </div>
    </div>
    <div
      class="grid align-items-center"
      *ngIf="node.data.nodeType === 'client-app'"
    >
      <div class="col-4  lg:col-3">
        {{
          'TenantManagement::Application:IsAuthenticationRequired'
            | abpLocalization
        }}
      </div>
      <div class="col-8 lg:col-9">
        <div class="p-inputgroup">
          <p-checkbox
            [binary]="true"
            [(ngModel)]="node.data.isAuthenticationRequired"
          ></p-checkbox>
        </div>
      </div>
    </div>
    <div
      class="grid align-items-center"
      *ngIf="node.data.nodeType === 'client-module'"
    >
      <div class="col-4  lg:col-3">
        {{ 'TenantManagement::LaodLevel' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <p-select
          id="loadLevel"
          [options]="loadLevels"
          [(ngModel)]="node.data.loadLevel"
          optionLabel="key"
          optionValue="value"
          appendTo="body"
          autoWidth="false"
          [style]="{ width: '100%' }"
        ></p-select>
      </div>
    </div>
    <div class="grid align-items-center">
      <div class="col-4  lg:col-3">
        {{ 'TenantManagement::HTMLHead' | abpLocalization }}
      </div>
      <div class="col-8 lg:col-9">
        <textarea
          class="w-full"
          id="name"
          type="text"
          pTextarea
          [rows]="5"
          [autoResize]="true"
          [(ngModel)]="node.data.icon"
        ></textarea>
      </div>
    </div>
  `,
})
export class GeneralSettingsComponent {
  @Input() node: TreeNode;
  @Input() nameEmpty: boolean = false;
  @Input() pathEmpty: boolean = false;
  @Input() tooltip: string;
  @Input() loadLevels: any[];

  @Output() resetValidators = new EventEmitter<void>();

  onResetValidators() {
    this.resetValidators.emit();
  }
}
