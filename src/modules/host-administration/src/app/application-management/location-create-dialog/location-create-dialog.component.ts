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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ILocalizationService, ITenantDomainsSelectionDialogService, TenantHostnameDto } from '@eleon/contracts.lib';

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
    InputGroupModule,
    InputGroupAddonModule,
    RippleModule,
    TooltipModule,
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
  loading = false;
  selectedTenantDomain: TenantHostnameDto | null = null;

  siteTypes = [
    { label: this.localizationService.instant('TenantManagement::SiteType:Redirect'), value: SiteType.Redirect },
    { label: this.localizationService.instant('TenantManagement::SiteType:Angular'), value: SiteType.Angular },
    { label: this.localizationService.instant('TenantManagement::SiteType:VirtualFolder'), value: SiteType.VirtualFolder },
  ];

  frameworkTypes = [
    { label: this.localizationService.instant('TenantManagement::ClientApplicationFrameworkType:None'), value: ClientApplicationFrameworkType.None },
    { label: this.localizationService.instant('TenantManagement::ClientApplicationFrameworkType:Angular'), value: ClientApplicationFrameworkType.Angular },
    { label: this.localizationService.instant('TenantManagement::ClientApplicationFrameworkType:React'), value: ClientApplicationFrameworkType.React },
    {
      label: this.localizationService.instant('TenantManagement::ClientApplicationFrameworkType:CustomAngular'),
      value: ClientApplicationFrameworkType.CustomAngular,
    },
    {
      label: this.localizationService.instant('TenantManagement::ClientApplicationFrameworkType:VirtualDirectory'),
      value: ClientApplicationFrameworkType.VirtualDirectory,
    },
  ];

  styleTypes = [
    { label: this.localizationService.instant('TenantManagement::ClientApplicationStyleType:PrimeNg'), value: ClientApplicationStyleType.PrimeNg },
    { label: this.localizationService.instant('TenantManagement::ClientApplicationStyleType:SakaiNg'), value: ClientApplicationStyleType.SakaiNg },
    { label: this.localizationService.instant('TenantManagement::ClientApplicationStyleType:Bootstrap'), value: ClientApplicationStyleType.Bootstrap },
    { label: this.localizationService.instant('TenantManagement::ClientApplicationStyleType:Material'), value: ClientApplicationStyleType.Material },
  ];

  virtualFolderTypes = [
    { label: this.localizationService.instant('TenantManagement::VirtualFolderType:Url'), value: VirtualFolderType.Url },
    { label: this.localizationService.instant('TenantManagement::VirtualFolderType:Provider'), value: VirtualFolderType.Provider },
  ];

  constructor(
    private messageService: MessageService,
    private localizationService: ILocalizationService,
    private tenantDomainsSelectionService: ITenantDomainsSelectionDialogService
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

  openTenantDomainSelectionDialog(): void {
    this.tenantDomainsSelectionService.openTenantDomainsSelection({
      title: this.localizationService.instant('TenantManagement::Hostname'),
      selectedTenantDomains: this.selectedTenantDomain ? [this.selectedTenantDomain] : [],
      ignoredTenantDomains: [],
      isMultiple: false,
      onSelect: (domains) => this.onTenantDomainSelected(domains)
    });
  }

  onTenantDomainSelected(domains: TenantHostnameDto[] | null): void {
    if (domains && domains.length > 0) {
      const selectedDomain = domains[0];
      this.selectedTenantDomain = selectedDomain;
      this.model.hostname = selectedDomain.domain || selectedDomain.url || '';
      this.onInput();
    } else {
      this.selectedTenantDomain = null;
      this.model.hostname = undefined;
      this.onInput();
    }
  }
}
