import { Component, Input, OnInit } from '@angular/core';
import {
  ClientApplicationService,
  UiModuleService,
  ApplicationModuleDto,
  EleoncoreModuleDto,
} from '@eleon/sites-management-proxy';
import { forkJoin, of } from 'rxjs';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { getRemoteInfo } from './remote-helper';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { TableModule } from 'primeng/table';

interface ExposeItem {
  key: string;
  displayName: string;
  pluginName: string;
  loadLevel: string;
  url: string;
  selected: boolean;
  isUnique: boolean; // New property to track uniqueness
}

@Component({
  selector: 'app-add-module-autodetect',
  standalone: true,
  templateUrl: './add-module-autodetect.component.html',
  imports: [
    SharedModule,
    CheckboxModule,
    InputTextModule,
    TableModule,
    SelectModule,
    ButtonModule,
  ],
})
export class AddModuleAutodetectComponent implements OnInit {
  @Input() applicationId: string;

  remoteUrl: string = '';
  exposesList: ExposeItem[] = [];

  loadLevels = [
    { label: 'Root', value: '1' },
    { label: 'SubModule', value: '2' },
    { label: 'Auto', value: '0' },
  ];

  existingModules: ApplicationModuleDto[] = [];

  constructor(
    private uiModuleService: UiModuleService,
    private clientApplicationService: ClientApplicationService,
    private dynamicDialogRef: DynamicDialogRef,
    private dynamicDialogConfig: DynamicDialogConfig<{
      applicationId: string;
      existingModules: ApplicationModuleDto[];
    }>,
    private localizedMessageService: LocalizedMessageService
  ) {
    this.applicationId = dynamicDialogConfig.data.applicationId;
    this.existingModules = dynamicDialogConfig.data.existingModules;
  }

  ngOnInit(): void {}

  async loadExposes() {
    try {
      const { pluginName, exposes, defaultLoadLevel } = await getRemoteInfo(
        this.remoteUrl
      );
      this.exposesList = exposes.map((key) => ({
        key,
        pluginName: pluginName,
        displayName: key.replace('./', ''),
        loadLevel: defaultLoadLevel,
        url: this.remoteUrl,
        selected: false,
        isUnique: true, // Assume unique initially
      }));
      this.checkExposeUniqueness();
    } catch (error) {
      console.error('Error loading exposes:', error);
    }
  }

  checkExposeUniqueness() {
    this.exposesList.forEach((expose) => {
      expose.isUnique = !this.existingModules.some(
        (existing) =>
          existing.pluginName === expose.pluginName &&
          existing.expose === expose.key
      );
    });
  }

  hasSelection(): boolean {
    return this.exposesList.some((item) => item.selected);
  }

  addSelectedModules() {
    const selectedItems = this.exposesList.filter((item) => item.selected);
    if (!selectedItems.length) return;

    const modules: ApplicationModuleDto[] = selectedItems.map((expose) => ({
      pluginName: expose.pluginName,
      loadLevel: expose.loadLevel,
      orderIndex: 0,
      clientApplicationEntityId: this.applicationId,
      expose: expose.key,
      url: this.remoteUrl,
      properties: [],
    }));

    this.clientApplicationService
      .addBulkModulesToApplicationByModules(modules)
      .subscribe((result) => {
        this.dynamicDialogRef.close();
        this.localizedMessageService.success('Infrastructure::Success');
      });
  }

  closeDialog() {
    this.dynamicDialogRef.close();
  }
}
