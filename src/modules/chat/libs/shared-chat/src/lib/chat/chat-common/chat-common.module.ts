import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatListLatestComponent } from "./chat-list-latest/chat-list-latest.component";
import { ChatBoxComponent } from "./chat-box/chat-box.component";
import { GroupChatCreateModalComponent } from "./group-chat-create-modal/group-chat-create-modal.component";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { ChatMembersSelectionBoxComponent } from "./chat-members-table-box/chat-members-table-box.component";
import { InputTextModule } from "primeng/inputtext";
import { UserChatsControlsComponent } from "./user-chats-controls/user-chats-controls.component";
import { ListboxModule } from "primeng/listbox";
import { TooltipModule } from "primeng/tooltip";
import { ChatMessagePreviewComponent } from "./chat-message-preview/chat-message-preview.component";
import { ChatMessageComponent } from "./chat-message/chat-message.component";
import { ChatMessageInputComponent } from "./chat-message-input/chat-message-input.component";
import {
  NbChatModule,
  NbIconModule,
  NbListModule,
  NbSpinnerModule,
  NbButtonModule,
} from "@nebular/theme";
import { MenuModule } from 'primeng/menu';
import { ChatControlsComponent } from "./chat-controls/chat-controls.component";
import { ChatUserAvatarComponent } from "./chat-message/chat-user-avatar/chat-user-avatar.component";
import { ChatListBoxComponent } from "./chat-list-box/chat-list-box.component";
import { ChatMembersManagementModalComponent } from "./chat-members-management-modal/chat-members-management-modal.component";
import { ChatMembersListComponent } from "./chat-members-list/chat-members-list.component";
import { ChatDocumentUploaderComponent } from "./chat-box/chat-document-uploader/chat-document-uploader.component";
import { ChatMessageContentComponent } from "./chat-message-content/chat-message-content.component";
import { ChatTitleComponent } from "./chat-title/chat-title.component";
import { TagModule } from "primeng/tag";
import { ChatIconComponent } from "./chat-icon/chat-icon.component";
import { ChatScreenshotUploaderComponent } from "./chat-box/chat-screenshot-uploader/chat-screenshot-uploader.component";
import { DocumentConversationButtonComponent } from "./document-conversation-button/document-conversation-button.component";
import { RequiredMarkDirective, RequiredMarkModule, SharedModule } from "@eleon/angular-sdk.lib";
import { ResponsiveTableModule } from "@eleon/primeng-ui.lib";
import { ChatRenameModalComponent } from "./chat-rename-modal";
import { ProfilePictureModule } from "@eleon/primeng-ui.lib";
import { DialogModule } from "primeng/dialog";
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox'
import { ChatListComponent } from "./chat-list/chat-list.component";
import { LazyScrollModule, LoadingModule } from "@eleon/primeng-ui.lib";
import { TabsModule } from 'primeng/tabs';
import { ChatViewerComponent } from "./chat-viewer/chat-viewer.component";
import { ChipModule } from 'primeng/chip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TextareaModule } from "primeng/textarea";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ChatRolesListComponent } from './chat-roles-list/chat-roles-list.component';
import { ChatUnitsListComponent } from './chat-units-list/chat-units-list.component';
import { PopoverModule } from 'primeng/popover';
import { ToastModule } from 'primeng/toast';
import { ChatMessageToastComponent } from './chat-message-toast'

@NgModule({
  declarations: [
    ChatListLatestComponent,
    ChatBoxComponent,
    GroupChatCreateModalComponent,
    ChatMembersSelectionBoxComponent,
    UserChatsControlsComponent,
    ChatMessagePreviewComponent,
    ChatMessageComponent,
    ChatMessageInputComponent,
    ChatControlsComponent,
    ChatUserAvatarComponent,
    ChatListBoxComponent,
    ChatMembersManagementModalComponent,
    ChatMembersListComponent,
    ChatDocumentUploaderComponent,
    ChatMessageContentComponent,
    ChatTitleComponent,
    ChatRenameModalComponent,
    ChatIconComponent,
    ChatScreenshotUploaderComponent,
    DocumentConversationButtonComponent,
    ChatListComponent,
    ChatViewerComponent,
    ChatRolesListComponent,
    ChatUnitsListComponent,
		ChatMessageToastComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TableModule,
    ResponsiveTableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ListboxModule,
      ChipModule,
    TooltipModule,
    NbChatModule,
    MenuModule,
    NbSpinnerModule,
    NbIconModule,
    NbButtonModule,
    TagModule,
    NbListModule,
    ProfilePictureModule,
      SelectModule,
    CheckboxModule,
      LazyScrollModule,
      TabsModule,
    InputGroupModule,
    InputGroupAddonModule,
      TextareaModule,
    ScrollPanelModule,
      PopoverModule,
		ToastModule,
    LoadingModule,
    RequiredMarkModule
  ],
  exports: [
    UserChatsControlsComponent,
    ChatListLatestComponent,
    ChatBoxComponent,
    ChatControlsComponent,
    ChatListBoxComponent,
    GroupChatCreateModalComponent,
    ChatMembersSelectionBoxComponent,
    ChatTitleComponent,
    DocumentConversationButtonComponent,
    ChatListComponent,
    ChatViewerComponent,
		ChatMessageToastComponent,
  ],
})
export class ChatCommonModule {}
