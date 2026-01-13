import { Component } from '@angular/core';
import { ApplicationModuleDto, EleoncoreModuleDto } from '@eleon/sites-management-proxy';
import { UiModuleService } from '@eleon/sites-management-proxy';
import { SharedModule } from '@eleon/angular-sdk.lib';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-ui-module-management',
  standalone: true,
  imports: [
    SharedModule,
    TableModule,
    DialogModule,
  ],
  templateUrl: './ui-module-management.component.html',
  styleUrl: './ui-module-management.component.css',
})
export class UiModuleManagementComponent {

  uiModules: EleoncoreModuleDto[];
  selectedUiModules: EleoncoreModuleDto[];
  uiModule: EleoncoreModuleDto;
  displayDialog: boolean;
  // loadTypes: { label: string, value: UiModuleLoadLevel }[] = [
  //   { label: 'Root', value: UiModuleLoadLevel.RootModule },
  //   { label: 'Submodule', value: UiModuleLoadLevel.SubModule },
  //   { label: 'Auto', value: UiModuleLoadLevel.Auto },
  // ];


  constructor(private uiModuleService: UiModuleService) {}

  ngOnInit() {
    this.loadUiModules();
  }

  loadUiModules() {
    this.uiModuleService.getEnabledModules().subscribe(data => {
      this.uiModules = data;
    });
  }

  editUiModule(uiModule: EleoncoreModuleDto) {
    this.uiModule = { ...uiModule };
    this.displayDialog = true;
  }

  saveUiModule() {
    if (this.uiModule.id) {
      this.uiModuleService.update(this.uiModule.id, this.uiModule).subscribe(() => {
        this.loadUiModules();
        this.displayDialog = false;
      });
    } else {
      this.uiModuleService.create(this.uiModule).subscribe(() => {
        this.loadUiModules();
        this.displayDialog = false;
      });
    }
  }

  deleteUiModule(id: string) {
    this.uiModuleService.delete(id).subscribe(() => {
      this.loadUiModules();
    });
  }

  cancel() {
    this.displayDialog = false;
  }

}
