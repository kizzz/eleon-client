import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { LocationDto } from '../../proxy/sites-management/module/locations/models';
import { LocationType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/location-type.enum';
import { SiteType } from '../../proxy/module-collector/sites-management/module/sites-management/module/domain/managers/locations/site-type.enum';
import { PipesModule, SharedModule } from '@eleon/angular-sdk.lib';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-location-details-panel',
  standalone: true,
  imports: [SharedModule, PipesModule, ButtonModule],
  templateUrl: './location-details-panel.component.html',
  styleUrls: ['./location-details-panel.component.scss'],
})
export class LocationDetailsPanelComponent {
  @Input() location: TreeNode<LocationDto> | null = null;

  @Output() edit = new EventEmitter<TreeNode<LocationDto>>();
  @Output() delete = new EventEmitter<TreeNode<LocationDto>>();

  LocationType = LocationType;
  SiteType = SiteType;

  get data(): LocationDto | undefined {
    return this.location?.data;
  }

  onEdit(): void {
    if (this.location) this.edit.emit(this.location);
  }

  onDelete(): void {
    if (this.location) this.delete.emit(this.location);
  }

  locationTypeLabel(t: LocationType): string {
    switch (t) {
      case LocationType.Proxy:
        return 'Proxy';
      case LocationType.Site:
        return 'Site';
      case LocationType.Location:
        return 'Location';
      default:
        return '—';
    }
  }

  siteTypeLabel(t: SiteType): string {
    switch (t) {
      case SiteType.None:
        return 'None';
      case SiteType.Redirect:
        return 'Redirect';
      case SiteType.Angular:
        return 'Angular';
      case SiteType.VirtualFolder:
        return 'VirtualFolder';
      default:
        return '—';
    }
  }
}
