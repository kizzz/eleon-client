import { IPermissionService, IVPortalTopbarService, VPortalTopbarItem }  from '@eleon/contracts.lib';
import { Subject } from "rxjs";


export class VPortalTopbarService extends IVPortalTopbarService {
  private _topbarItems: VPortalTopbarItem[] = [];
  public refreshRequested = new Subject<void>();

  get menuItemTree(): VPortalTopbarItem[] {
    return this.getMenuItemTree();
  }

  get topbarItems(): VPortalTopbarItem[] {
    return this._topbarItems;
  }

  constructor(private permissionService: IPermissionService) {
    super();
  }

  add(topbarItem: VPortalTopbarItem) {
    this._topbarItems = [...this._topbarItems, topbarItem];
  }

  addRange(topbarItems: VPortalTopbarItem[]) {
    this._topbarItems = [...this._topbarItems, ...topbarItems];
  }

  public refresh() {
    this.refreshRequested.next();
  }

  
  public clear() {
    this._topbarItems = [];
    this.refreshRequested.next();
  }
  
  private getMenuItemTree(parentName?: string): VPortalTopbarItem[] {
    const items = this._topbarItems
      .filter((m) => m.parentName == parentName)
      .map(
        (m) =>
          ({
            ...m,
            items: this.getMenuItemTree(m.label),
          } satisfies VPortalTopbarItem)
      )
      .sort((a, b) => a.order - b.order);
    return items.filter((m) => m.routerLink?.length || m.items?.length);
  }

  private menuItemAllowed(item: VPortalTopbarItem): boolean {
    return true;
    // if (!item.requiredPolicy) {
    //   return true;
    // }
    // return this.permissionService.getGrantedPolicy(item.requiredPolicy);
  }
}
