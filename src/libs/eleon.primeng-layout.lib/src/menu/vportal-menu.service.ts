import { IAuthManager } from '@eleon/contracts.lib';
import { Subject } from "rxjs";
import { IPermissionService, IVPortalMenuService, VPortalMenuItem } from '@eleon/contracts.lib';



export class VPortalMenuService extends IVPortalMenuService {
  private _menuItems: VPortalMenuItem[] = [];
  public refreshRequested = new Subject<void>();

  public menuItemClicked = new Subject<any>();

  get menuItemTree(): VPortalMenuItem[] {
    return this.getMenuItemTree();
  }

  constructor(
    private permissionService: IPermissionService,
    private authService: IAuthManager,
  ) {
    super();
  }

  public itemClicked(value: any) {
    this.menuItemClicked.next(value);
  }

  add(menuItem: VPortalMenuItem) {
    this._menuItems = [...this._menuItems, menuItem];
  }

  addRange(menuItems: VPortalMenuItem[]) {
    this._menuItems = [...this._menuItems, ...menuItems];
  }

  remove(menuItem: VPortalMenuItem) {
    this._menuItems = this._menuItems.filter(item => item.label !== menuItem.label);
  }  

  public refresh() {
    this.refreshRequested.next();
  }


  private getMenuItemTree(parentName?: string): VPortalMenuItem[] {
    const items = this._menuItems
      .filter((m) => m.parentName == parentName && this.menuItemAllowed(m))
      .filter((m, index, array) => array.findIndex(mm => mm.label == m.label && mm.routerLink ==  m.routerLink) == index)
      .map(
        (m) =>
          ({
            ...m,
            items: this.getMenuItemTree(m.label),
          } satisfies VPortalMenuItem)
      )
      .sort((a, b) => a.order - b.order);
    return items.filter((m) => m.routerLink?.length || m.items?.length);
  }

  private menuItemAllowed(item: VPortalMenuItem): boolean {
    if (item.requiredAuthorize && !this.authService.isAuthenticated()) {
      return false;
    }
    if (!item.requiredPolicy) {
      return true;
    }
    return this.permissionService.getGrantedPolicy(item.requiredPolicy);
  }
}
