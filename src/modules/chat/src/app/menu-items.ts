
import { DefaultParentMenuItems, VPortalMenuItem } from "@eleon/angular-sdk.lib";


export const chatMenuItems: VPortalMenuItem[] = [
  {
    routerLink: "/home",
    label: DefaultParentMenuItems.Application,
    icon: "fa fa-house",
    parentName: null,
    order: 0,
  },
  {
    routerLink: '/collaboration/chats',
    label: 'Collaboration::Chats',
    icon: 'fas fa-comments',
    parentName: DefaultParentMenuItems.Application,
    order: 1,
    requiredAuthorize: true,
  }
] as any;
