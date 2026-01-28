import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ResponsiveTableModule } from '@eleon/primeng-ui.lib';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-modules-settings',
  standalone: true,
  imports: [
    SharedModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ResponsiveTableModule,
    TooltipModule,
  ],
  template: `
    <p-table
      #modulesTable
      [value]="modules"
      [paginator]="true"
      [rows]="5"
      [totalRecords]="modules?.length"
      [rowHover]="true"
      [(first)]="firstModulesRowIx"
      [globalFilterFields]="['displayName', 'path', 'source']"
      [(selection)]="selectedModules"
      dataKey="id"
      [loading]="loading"
    >
      <ng-template pTemplate="caption">
        <div class="grid mt-0">
          <div
            class="col-10 md:pl-4 p-0 flex align-items-center justify-content-end"
          >
            <div class="p-inputgroup">
              <input
                type="text"
                pInputText
                [(ngModel)]="searchQueryText"
                (input)="onSearch($event)"
                placeholder="{{ 'Infrastructure::Search' | abpLocalization }}"
                autofocus
              />
              <button
                type="button"
                pButton
                pRipple
                icon="pi pi-times-circle"
                class="p-button-danger p-button-text"
                (click)="onClearSearch()"
              ></button>
            </div>
          </div>
          <div
            class="col-2 py-3 md:py-0 flex align-items-center justify-content-center lg:justify-content-end"
          >
            <div class="flex align-items-center">
              <p-button
                type="button"
                icon="pi pi-sync"
                (click)="reload.emit()"
                [text]="true"
                [raised]="true"
                [label]="'TenantManagement::Reload' | abpLocalization"
                styleClass="p-button-warning"
                class="p-button-text"
              >
              </p-button>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="header">
        <tr>
          <th appResponsiveColumn="30"><p-tableHeaderCheckbox /></th>
          <th>{{ 'TenantManagement::DisplayName' | abpLocalization }}</th>
          <th appResponsiveColumn="260">
            {{ 'TenantManagement::Path' | abpLocalization }}
          </th>
          <th appResponsiveColumn="260">
            {{ 'TenantManagement::Source' | abpLocalization }}
          </th>
          <th appResponsiveColumn="100">
            {{ 'TenantManagement::LoadLevel' | abpLocalization }}
          </th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td>
            <p-tableCheckbox [value]="row" />
          </td>
          <td>
            <div class="flex align-items-center gap-2">
              <span>
                <i class="fa-solid fa-puzzle-piece"></i>
              </span>
              <app-ellipsis [text]="row.displayName"></app-ellipsis>
            </div>
          </td>
          <td>
            <app-ellipsis [text]="row.path"></app-ellipsis>
          </td>
          <td>
            {{ row.source }}
          </td>
          <td>
            {{ formatLoadLevel(row.loadLevel) }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ModulesSettingsComponent {
  @Input() modules: any[] = [];
  @Input() loading: boolean = false;
  @Input() loadLevels: any[];

  @Output() reload = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  firstModulesRowIx: number = 0;
  searchQueryText: string = '';
  selectedModules: any[] = [];

  formatLoadLevel(loadLevel: string) {
    return this.loadLevels.find((result) => result.value == loadLevel)?.label;
  }

  onSearch(event: any) {
    this.search.emit(event.target.value);
    this.firstModulesRowIx = 0;
  }

  onClearSearch() {
    this.searchQueryText = '';
    this.clearSearch.emit();
    this.firstModulesRowIx = 0;
  }
}
