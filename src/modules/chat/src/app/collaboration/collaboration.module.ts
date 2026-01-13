import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CollaborationRoutingModule } from "./collaboration-routing.module";
import { SharedModule } from '@eleon/angular-sdk.lib';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PageTitleModule } from '@eleon/primeng-ui.lib';
import { DialogModule } from "primeng/dialog";
import { ChatCommonModule } from "src/modules/chat/libs/shared-chat/src";
import { SplitterModule } from "primeng/splitter";
import { ChatsComponent } from "./chats/chats/chats.component";
import { LazyScrollModule } from "@eleon/primeng-ui.lib";
import { DrawerModule } from "primeng/drawer";
import { SupportTicketsComponent } from "./support-tickets/support-tickets/support-tickets.component";
import { SupportTicketSearchResultsComponent } from "./support-tickets/support-ticket-search-results/support-tickets-search-results.component";
import { SupportTicketViewerComponent } from "./support-tickets/support-ticket-viewer/support-ticket-viewer.component";
import { SupportTicketListComponent } from "./support-tickets/support-ticket-list/support-ticket-list.component";
import { ProfilePictureModule } from '@eleon/primeng-ui.lib';
import { SupportTicketCreationModalComponent } from "./support-tickets/support-ticket-creation-modal";
import { TableModule } from "primeng/table";
import { ResponsiveTableModule } from "@eleon/primeng-ui.lib";
import { TabsModule } from 'primeng/tabs';

@NgModule({
  declarations: [
    ChatsComponent,
    SupportTicketsComponent,
    SupportTicketSearchResultsComponent,
    SupportTicketViewerComponent,
    SupportTicketListComponent,
    SupportTicketCreationModalComponent
  ],
  imports: [
    CommonModule,
    CollaborationRoutingModule,
    SharedModule,
    ButtonModule,
    InputTextModule,
    PageTitleModule,
    DialogModule,
    ChatCommonModule,
    SplitterModule,
    LazyScrollModule,
    DrawerModule,
    ProfilePictureModule,
    TableModule,
    ResponsiveTableModule,
    TabsModule,
  ],
})
export class CollaborationModule {}
