import {
  Component,
  effect,
  Input,
  Injector,
  runInInjectionContext,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { EcContainerItem, IEcContainerService } from '@eleon/contracts.lib';
import { IAuthManager, IPermissionService } from '@eleon/contracts.lib';

@Component({
  standalone: true,
  selector: 'ec-container',
  template: `<ng-container #contentComponent></ng-container>`
})
export class EcContainerComponent {
  @Input()
  key: string;

  @ViewChild('contentComponent', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  constructor(
    public ecContainerService: IEcContainerService,
    private injector: Injector,
    public authService: IAuthManager,
    public permissionService: IPermissionService,
  ) { }

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const containers = this.ecContainerService.containers();
        if (this.key && containers[this.key]) {
          this.updateComponents(containers[this.key]);
        }
      });
    });
  }

  updateComponents(components: EcContainerItem[]) {
    this.container.clear();
    this.getAllowedContainerItems(components).forEach(item => {
      this.container.createComponent(item.component);
    });
  }

  getAllowedContainerItems(components: EcContainerItem[]) {
    return components
      .filter(item => {
        if (item.requiredAuthorize && !this.authService.isAuthenticated()) {
          return false;
        }
        if (!item.requiredPolicy) {
          return true;
        }
        return this.permissionService.getGrantedPolicy(item.requiredPolicy);
      })
      .sort((a, b) => {
        const aIndex = a.orderIndex ?? 0;
        const bIndex = b.orderIndex ?? 0;
        return aIndex - bIndex;
      });
  }

}
