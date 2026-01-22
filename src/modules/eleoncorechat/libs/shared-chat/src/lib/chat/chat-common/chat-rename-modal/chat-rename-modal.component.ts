
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { UserChatInfoDto } from '@eleon/collaboration-proxy';
import { ChatRoomService } from '@eleon/collaboration-proxy';
import { MessageService } from "primeng/api";
import { finalize } from "rxjs";

@Component({
  standalone: false,
  selector: "app-chat-rename-modal",
  templateUrl: "./chat-rename-modal.component.html",
  styleUrls: ["./chat-rename-modal.component.scss"],
})
export class ChatRenameModalComponent implements OnChanges {
  public loading: boolean = false;
  public chatNewName: string;

  @Input()
  chatId: string;

  @Input()
  chatName: string;
  @Output()
  chatNameChange = new EventEmitter<string>();

  @Input()
  showDialog: boolean = false;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  constructor(
    private chatRoomService: ChatRoomService,
    private msgService: MessageService,
    private localizationService: ILocalizationService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatName']) {
      this.chatNewName = this.chatName;
    }
  }

  public onCancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(this.showDialog);
  }

  public onRename(): void {
    this.loading = true;
    this.chatRoomService
      .renameChatByChatIdAndNewName(this.chatId, this.chatNewName)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.msgService.add({
          severity: "success",
          summary: this.localizationService.instant("Collaboration::RenameChat:Success"),
        });
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
        this.chatName = this.chatNewName;
        this.chatNameChange.emit(this.chatName);
      });
  }
}
