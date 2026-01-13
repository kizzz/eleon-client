import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MemberDto, MemberType } from '@eleon/accounting-proxy';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { PageStateService } from '@eleon/primeng-ui.lib';
import { generateTempGuid } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.scss']
})
export class MemberCreateComponent implements OnInit, OnChanges {
  @Input()
  display: boolean = false;

  @Input()
  memberData: MemberDto | null = null;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Output()
  saveEvent = new EventEmitter<MemberDto>();

  editedMember: MemberDto = {
    id: generateTempGuid(),
    refId: '',
    type: MemberType.User,
  };

  memberTypeOptions = [
    { value: MemberType.Tenant, name: '' },
    { value: MemberType.User, name: '' },
  ];

  refIdEmpty: boolean = false;
  loading: boolean = false;

  constructor(
    public localizationService: ILocalizationService,
    public messageService: LocalizedMessageService,
    private pageStateService: PageStateService
  ) {}

  ngOnInit(): void {
    this.initializeMemberTypes();
  }

  ngOnChanges(): void {
    // Changes will be handled in onDialogShow when dialog becomes visible
  }

  initializeMemberTypes(): void {
    this.memberTypeOptions = [
      {
        value: MemberType.Tenant,
        name: this.localizationService.instant(
          `AccountingModule::MemberType:${MemberType[MemberType.Tenant]}`
        ),
      },
      {
        value: MemberType.User,
        name: this.localizationService.instant(
          `AccountingModule::MemberType:${MemberType[MemberType.User]}`
        ),
      },
    ];
  }

  onDialogShow(): void {
    if (this.memberData) {
      // Editing existing member
      this.editedMember = {
        ...this.memberData,
      };
    } else {
      // Creating new member
      this.editedMember = {
        id: generateTempGuid(),
        refId: '',
        type: MemberType.User,
      };
    }
    this.refIdEmpty = false;
  }

  onDialogHide(): void {
    this.displayChange.emit(false);
  }

  save(): void {
    const valid = this.validate();
    if (!valid) return;

    this.pageStateService.setDirty();
    this.saveEvent.emit({ ...this.editedMember });
    this.onDialogHide();
  }

  cancel(): void {
    this.onDialogHide();
  }

  validate(): boolean {
    this.refIdEmpty = false;
    let errors: string[] = [];

    if (!this.editedMember.refId || this.editedMember.refId.trim().length === 0) {
      this.refIdEmpty = true;
      errors.push('AccountingModule::Error:RefIdEmpty');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        this.messageService.error(err);
      }
      return false;
    }

    return true;
  }

  resetRefIdValidator(): void {
    this.refIdEmpty = false;
  }
}

