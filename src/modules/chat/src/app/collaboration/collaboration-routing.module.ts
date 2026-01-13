import { NgModule } from "@angular/core";
import { RouterModule, ROUTES, Routes } from "@angular/router";
import { ChatsComponent } from "./chats/chats/chats.component";
import { SupportTicketsComponent } from "./support-tickets/support-tickets/support-tickets.component";
import { provideOnInitialization } from '@eleon/angular-sdk.lib';
import { CHAT_MODULE_CONFIG } from '@eleon/angular-sdk.lib';
import { chatMenuItems } from '../menu-items'
import { logger } from '@nx/devkit'

const routes: Routes = [
  {
    path: "chats",
    component: ChatsComponent,
    data: {
      title: "Collaboration::ChatList:Title",
      tabLangKey: "Collaboration::Channels",
      tags: [],
    },
  },
  // {
  //   path: "support-tickets",
  //   component: SupportTicketsComponent,
  //   data: {
  //     name: "Collaboration::SupportTicketList:Title",
  //   },
  // },
];

export function dynamicRoutesFactory(cfg: any) {
	if (!cfg){
		return [];
	}

	console.log('Generating dynamic routes based on chat config:', cfg);

	const dynamicChatRoutes = cfg?.routes?.map(r => ({
    path: r.route.replace(/^\/+/, ''),
    component: ChatsComponent,
    data: { title: r.title, tags: r.tags || [] }
  })) || [];

	console.log('Collaboration module dynamic routes:', dynamicChatRoutes);

  return dynamicChatRoutes;
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
	providers: [
    {
      provide: ROUTES,
      multi: true,
      useFactory: dynamicRoutesFactory,
			deps: [CHAT_MODULE_CONFIG]
    }
  ]
})
export class CollaborationRoutingModule {}
