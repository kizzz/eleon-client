import { Component, Input } from '@angular/core';
import { ChatMemberInfo } from '@eleon/collaboration-proxy';

@Component({
  standalone: false,
  selector: 'app-chat-user-avatar',
  templateUrl: './chat-user-avatar.component.html',
  styleUrls: ['./chat-user-avatar.component.scss']
})
export class ChatUserAvatarComponent {
  @Input()
  user: ChatMemberInfo;
}
