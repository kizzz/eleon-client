import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AccountStatus } from '@eleon/accounting-proxy';

interface LocalizedAccountStatus {
  name: string;
  value: AccountStatus;
}

const icons: { [key: number]: string } = {
  [AccountStatus.Active]: 'fas fa-check',
  [AccountStatus.New]: 'fas fa-plus',
  [AccountStatus.Canceled]: 'fas fa-ban',
  [AccountStatus.Deleted]: 'fas fa-ban',
  [AccountStatus.Generating]: 'fas fa-shoe-prints',
  [AccountStatus.Suspended]: 'fas fa-ban',
}

@Component({
  standalone: false,
  selector: 'app-account-status-tag',
  templateUrl: './account-status-tag.component.html',
  styleUrls: ['./account-status-tag.component.scss']
})

export class AccountStatusTagComponent implements OnInit, OnChanges {
  localizedAccountStatuses: LocalizedAccountStatus[];
  @Input()
  value: AccountStatus;

  localizedValue: string;

  @Input()
  textBefore: string = '';
  @Input()
  textAfter: string = '';

  constructor(
    public localizationService: ILocalizationService,
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.setValue();
    }
  }

  get display(): boolean {
    return !isNaN(this.value);
  }

  ngOnInit(): void {
    this.localizedAccountStatuses = Object.keys(AccountStatus)
      .filter((v) => isNaN(Number(v)))
      .map((name) => ({
        value: AccountStatus[name as keyof typeof AccountStatus],
        name: this.localizationService.instant(`Infrastructure::AccountStatus:${name}`),
      }));
      this.setValue();
  }

  setValue(): void {
    const localizedValue = this.localizedAccountStatuses.find(x => x.value === this.value)?.name;
    this.localizedValue = localizedValue ? this.textBefore + localizedValue + this.textAfter : undefined;
  }

  getIcon() {
    return icons[this.value];
  }

  getStyleClass() {
    return AccountStatus[this.value]?.toLowerCase();
  }
}
