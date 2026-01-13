import { Component } from '@angular/core';
import { LifecycleService } from '../../lifecycle-services/lifecycle-service';
import {
  ILocalizationService,
  IPermissionService,
} from '@eleon/angular-sdk.lib';
import { contributeControls, PageControls } from '@eleon/primeng-ui.lib';

@Component({
  standalone: false,
  selector: 'app-lifecycle-flows-page',
  templateUrl: './lifecycle-flows-page.component.html',
  styleUrls: ['./lifecycle-flows-page.component.scss'],
})
export class LifecycleFlowsPage {
  loading = false;
  @PageControls()
  controls = contributeControls([
    {
      key: 'Lifecycle::StatesGroup:AddWorkflow',
      icon: 'pi pi-plus',
      severity: 'primary',
      show: () => this.isLifecycleManager(),
      loading: () => this.loading,
      disabled: () => this.loading,
      action: () => this.lifecycleService.addWorkFlowRowClicked(true),
    },
  ]);

  constructor(
    private lifecycleService: LifecycleService,
    private permissionService: IPermissionService
  ) {}

  isLifecycleManager() {
    return true;  // TODO: return this.permissionService.getGrantedPolicy('LifecycleFeatureModule.LifecycleManager');
  }
}
