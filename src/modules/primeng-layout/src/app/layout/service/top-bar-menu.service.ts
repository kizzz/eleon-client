import { Injectable } from '@angular/core';
import { IVPortalTopbarService, VPortalTopbarItem } from '@eleon/angular-sdk.lib'

@Injectable({
  providedIn: 'root',
})
export class TopBarMenuService {
  constructor(
    // private applicationMenuItemService: ApplicationMenuItemService,
    // private clientApplicationService: ClientApplicationService,
    private vPortalTopbarService: IVPortalTopbarService
  ) {
  }

  initTopBarMenu(){
    // this.clientApplicationService.getEnabledApplications().subscribe((reply: ClientApplicationDto[]) => {
    //   if(reply?.length > 0 && !!reply?.find(clientApp=> document.baseURI.includes(clientApp.path))){
    //     this.getTopBarMenuItems(reply?.find(clientApp=> document.baseURI.includes(clientApp.path)));
    //   }
    // });
  }

  // private getTopBarMenuItems(application: ClientApplicationDto) {
  //     this.applicationMenuItemService
  //         .getListByApplicationIdAndMenuType(application.id, MenuType.Top)
  //         .subscribe((reply: ApplicationMenuItemDto[]) => {
  //             this.vPortalTopbarService.clear();
              
  //             if (reply?.length > 0 && reply?.some(c => c.display)) {
  //                 let items: VPortalTopbarItem[] = [];

  //                 let menuItems = reply.filter(c => c.itemType === ItemType.MenuItem) || [];
  //                 let categories = reply.filter(c => c.itemType === ItemType.Category) || [];
  //                 let noCategories: ApplicationMenuItemDto[] = [];

  //                 menuItems
  //                     ?.filter(x => !x.parentName?.length || x.parentName === "No Category")
  //                     .forEach(item => {
  //                         noCategories.push({
  //                             ...item,
  //                             itemType: ItemType.Category,
  //                             icon: item.icon || 'pi pi-folder',
  //                             order: item.order ?? 0
  //                         } as ApplicationMenuItemDto);
  //                     });

  //                 categories = categories?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //                 noCategories = noCategories?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //                 let unionCategories = [...noCategories, ...categories];
  //                 unionCategories?.forEach((category: ApplicationMenuItemDto) => {
  //                     let item: VPortalTopbarItem = {
  //                         label: category.label,
  //                         icon: category.icon,
  //                         routerLink: category.path,
  //                         items: this.getItems(category.label, menuItems),
  //                         parentName: category.parentName,
  //                         requiredPolicy: category.requiredPolicy,
  //                         order: category.order,
  //                     } as VPortalTopbarItem;

  //                     items.push(item);
  //                 });

  //                 this.vPortalTopbarService.addRange(items);
  //                 this.vPortalTopbarService.refresh();
  //             }
  //         });
  // }


  private getItems(parentName: string, menuItems: any[]): VPortalTopbarItem[] {
    let items: VPortalTopbarItem[] = [];
    menuItems.forEach((menuItem: any) => {
        if (menuItem.parentName === parentName) {
            let item: VPortalTopbarItem = {
                label: menuItem.label,
                icon: menuItem.icon,
                routerLink: menuItem.path,
                items: this.getItems(menuItem.label, menuItems),
                parentName: menuItem.parentName,
                requiredPolicy: menuItem.requiredPolicy,
                order: menuItem.order
            };
            items.push(item);
        }
    });

    items = items?.sort((a,b)=>a.order - b.order);
    return items;
  }
}