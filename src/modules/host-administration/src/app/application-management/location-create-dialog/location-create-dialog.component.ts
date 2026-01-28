import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TreeNode } from 'primeng/api';
import { LocationDto } from '../../proxy/sites-management/module/locations/models';
import { LocationType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/location-type.enum';
import { SiteType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/site-type.enum';
import { VirtualFolderType } from '../../proxy/common/module/constants/virtual-folder-type.enum';
import { ClientApplicationFrameworkType } from '../../proxy/common/module/constants/client-application-framework-type.enum';
import { ClientApplicationStyleType } from '../../proxy/common/module/constants/client-application-style-type.enum';
import {
  PipesModule,
  RequiredMarkModule,
  SharedModule,
} from '@eleon/angular-sdk.lib';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  selector: 'app-location-create-dialog',
  standalone: true,
  imports: [
    SharedModule,
    PipesModule,
    RequiredMarkModule,
    InputTextModule,
    FormsModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    DialogModule,
  ],
  templateUrl: './location-create-dialog.component.html',
  styleUrls: ['./location-create-dialog.component.scss'],
})
export class LocationCreateDialogComponent {
  @Input() model!: LocationDto;
  @Input() isEdit = false;
  @Input() allLocations: TreeNode<LocationDto>[] = [];
  @Input() visible = false;

  @Output() save = new EventEmitter<LocationDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<LocationDto>();
  @Output() visibleChange = new EventEmitter<boolean>();

  LocationType = LocationType;
  SiteType = SiteType;

  nameEmpty = false;
  pathEmpty = false;

  siteTypes = [
    { label: 'None', value: SiteType.None },
    { label: 'Redirect', value: SiteType.Redirect },
    { label: 'Angular', value: SiteType.Angular },
    { label: 'VirtualFolder', value: SiteType.VirtualFolder },
  ];

  frameworkTypes = [
    { label: 'None', value: ClientApplicationFrameworkType.None },
    { label: 'Angular', value: ClientApplicationFrameworkType.Angular },
    { label: 'React', value: ClientApplicationFrameworkType.React },
    {
      label: 'Custom Angular',
      value: ClientApplicationFrameworkType.CustomAngular,
    },
    {
      label: 'Virtual Directory',
      value: ClientApplicationFrameworkType.VirtualDirectory,
    },
  ];

  styleTypes = [
    { label: 'None', value: ClientApplicationStyleType.None },
    { label: 'PrimeNg', value: ClientApplicationStyleType.PrimeNg },
    { label: 'SakaiNg', value: ClientApplicationStyleType.SakaiNg },
    { label: 'Bootstrap', value: ClientApplicationStyleType.Bootstrap },
    { label: 'Material', value: ClientApplicationStyleType.Material },
  ];

  virtualFolderTypes = [
    { label: 'None', value: VirtualFolderType.None },
    { label: 'Url', value: VirtualFolderType.Url },
    { label: 'Provider', value: VirtualFolderType.Provider },
  ];

  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService
  ) {}

  resetValidators(): void {
    this.nameEmpty = false;
    this.pathEmpty = false;
  }

  onInput(): void {
    this.resetValidators();
    this.valueChange.emit(this.model);
  }

  emitCancel(): void {
    this.resetValidators();
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.emitCancel();
  }

  get dialogHeader(): string {
    return this.isEdit
      ? (this.localizationService.instant(
          'TenantManagement::EditLocation'
        ) as string)
      : (this.localizationService.instant(
          'TenantManagement::CreateLocation'
        ) as string);
  }

  addProperty(): void {
    this.model.properties = this.model.properties ?? [];
    this.model.properties.push({ key: '', value: '' });
    this.valueChange.emit(this.model);
  }

  removeProperty(idx: number): void {
    this.model.properties?.splice(idx, 1);
    this.valueChange.emit(this.model);
  }

  addModule(): void {
    this.model.modules = this.model.modules ?? [];
    this.model.modules.push({
      orderIndex: this.model.modules.length,
      properties: [],
    });
    this.valueChange.emit(this.model);
  }

  removeModule(idx: number): void {
    this.model.modules?.splice(idx, 1);
    this.valueChange.emit(this.model);
  }

  emitSave(): void {
    const name = this.model.name?.trim() ?? '';
    const path = this.model.path?.trim() ?? '';
    const requirePath = this.model.locationType === LocationType.Site;
    let isValid = true;

    if (!name.length) {
      this.nameEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsEmpty'
        ),
      });
      isValid = false;
    }

    if (name.length && this.allLocations?.some((n) => this.hasName(n, name))) {
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:NameIsNotUnique'
        ),
      });
      this.nameEmpty = true;
      isValid = false;
    }

    if (requirePath && !path.length) {
      this.pathEmpty = true;
      this.messageService.add({
        severity: 'error',
        summary: this.localizationService.instant(
          'TenantManagement::Error:PathIsEmpty'
        ),
      });
      isValid = false;
    }

    if (!isValid) return;

    this.model.name = name;
    this.model.path = path || undefined;
    this.model.hostname = this.model.hostname?.trim() || undefined;
    this.model.destinationPath =
      this.model.destinationPath?.trim() || undefined;
    this.model.source = this.model.source?.trim() || undefined;
    this.model.sourceId = this.model.sourceId?.trim() || undefined;
    this.resetValidators();
    this.visible = false;
    this.visibleChange.emit(false);
    this.save.emit(this.model);
  }

  private hasName(node: TreeNode<LocationDto>, name: string): boolean {
    const excludeId = this.isEdit ? this.model.id : undefined;
    if (node.data?.name?.toLowerCase() === name.toLowerCase()) {
      if (excludeId && node.data?.id === excludeId) return false;
      return true;
    }
    if (node.children?.length) {
      return node.children.some((c) => this.hasName(c, name));
    }
    return false;
  }
}
