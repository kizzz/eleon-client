
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  SupportTicketService,
} from '@eleon/collaboration-proxy';
import { CommonUserDto } from '@eleon/tenant-management-proxy';
import { MessageService } from "primeng/api";

@Component({
  standalone: false,
  selector: "app-support-ticket-creation-modal",
  templateUrl: "./support-ticket-creation-modal.component.html",
  styleUrls: ["./support-ticket-creation-modal.component.scss"],
})
export class SupportTicketCreationModalComponent implements OnChanges {
  loading: boolean = false;
  selectedUsers: CommonUserDto[] = [];
  chatName: string;
  nameInvalid: boolean = false;

  @Input()
  showDialog: boolean = false;
  @Output()
  showDialogChange = new EventEmitter<boolean>();

  constructor(
    private ticketService: SupportTicketService,
    private messageService : MessageService,
    private localizationService: ILocalizationService
  ) {}

  public show(): void {
    this.showDialog = true;
    this.chatName = "";
    this.selectedUsers = [];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["showDialog"]?.currentValue) {
      this.selectedUsers = [];
      this.chatName = null;
    }
  }

  public onCreatePressed(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.ticketService
      .createSupportTicketByRequest({
        title: this.chatName,
        initialMembers: this.selectedUsers.map((user) => user.id),
      })
      .subscribe({
        next: async (chat) => {
          this.messageService.add({severity:'success', summary: this.localizationService.instant("Collaboration::CreateSupportTicket:CreateSuccess")});
          this.showDialog = false;
          this.showDialogChange.emit(false);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.add({severity:'error', summary: this.localizationService.instant("Collaboration::CreateSupportTicket:CreateFail")});
        },
      });
  }
}
