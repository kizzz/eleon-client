import { Subject } from "rxjs";
import { IVPortalUserMenuService, VPortalUserMenuItem } from "@eleon/contracts.lib";


export class VPortalUserMenuService extends IVPortalUserMenuService {
  private _userMenuItems: VPortalUserMenuItem[] = [];
  public refreshRequested = new Subject<void>();

  get userMenuItemTree(): VPortalUserMenuItem[] {
    return this.getUserMenuItemTree();
  }

  constructor() {
    super();
  }

  addUserMenuItem(userMenuItem: VPortalUserMenuItem) {
    this._userMenuItems = this.getDistinctByProps([...this._userMenuItems, userMenuItem], ['label', 'parentName', 'routerLink'])
    this.refresh();
  }

  addUserMenuItemRange(userMenuItems: VPortalUserMenuItem[]) {
    this._userMenuItems = this.getDistinctByProps([...this._userMenuItems, ...userMenuItems], ['label', 'parentName', 'routerLink'])
    this.refresh();
  }

  remove(menuItem: VPortalUserMenuItem) {
    this._userMenuItems = this.executeRemove(menuItem);
    this.refresh();
  }


  private executeRemove(menuItem: VPortalUserMenuItem, items: VPortalUserMenuItem[] = this._userMenuItems): VPortalUserMenuItem[] {
    return items
    .filter(item => item.label !== menuItem.label)
    .map(item => ({
      ...item,
      items: item.items ? this.executeRemove(menuItem, item.items) : item.items 
    }));
}

  public refresh() {
    this.refreshRequested.next();
  }

  private getUserMenuItemTree(parentName?: string): VPortalUserMenuItem[] {
    const result = this._userMenuItems.filter((m) => m.label?.length || m.items?.length).sort((a, b) => a.order - b.order);

      // .filter((m) => m.parentName == parentName) //todo: check if this is needed
      // .map(
      //   (m) =>
      //     ({
      //       ...m,
      //       items: this.getUserMenuItemTree(m.label),
      //     } satisfies VPortalUserMenuItem)
      // )

    return result;
  }

  getDistinctByProps(array, props) {
    const seenKeys = new Set();
    const distinctArray = [];

    for (const item of array) {
      // 1. Create a unique key for the current item
      // This key combines the values of the specified properties, e.g., "valueA|valueB"
      const key = props.map(prop => item[prop]).join('|');

      // 2. Check if this key has already been seen
      if (!seenKeys.has(key)) {
        // 3. If the key is new, add it to the Set and keep the item
        seenKeys.add(key);
        distinctArray.push(item);
      }
    }

    return distinctArray;
  }
}
