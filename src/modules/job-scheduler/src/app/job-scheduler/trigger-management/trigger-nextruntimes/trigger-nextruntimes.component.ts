import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TriggerService } from '@eleon/job-scheduler-proxy';
import { NextRuntimesRequestDto } from '../../../proxy/eleon/job-scheduler/module/full/eleon/job-scheduler/module/application/contracts/triggers/models';
import { ILocalizationService } from '@eleon/angular-sdk.lib';
import { LocalizedMessageService } from '@eleon/primeng-ui.lib';
import { handleError } from '@eleon/angular-sdk.lib';
import { finalize } from 'rxjs/operators';

interface NextRuntimeRow {
  runTime: string;
  displayTime: string;
}

@Component({
  standalone: false,
  selector: 'app-trigger-nextruntimes',
  templateUrl: './trigger-nextruntimes.component.html',
  styleUrls: ['./trigger-nextruntimes.component.scss'],
})
export class TriggerNextRuntimesComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() triggerId: string;

  runtimes: NextRuntimeRow[] = [];
  filteredRuntimes: NextRuntimeRow[] = [];
  loading = false;
  searchQuery = '';
  count = 50;

  constructor(
    private triggerService: TriggerService,
    public localizationService: ILocalizationService,
    private messageService: LocalizedMessageService
  ) {}

  ngOnInit(): void {
    if (this.visible && this.triggerId) {
      this.loadNextRuntimes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue && this.triggerId) {
      this.count = 50;
      this.loadNextRuntimes();
    }
    if (changes['triggerId'] && this.visible && this.triggerId) {
      this.count = 50;
      this.loadNextRuntimes();
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(visible);
    if (visible && this.triggerId) {
      this.loadNextRuntimes();
    } else {
      this.runtimes = [];
      this.filteredRuntimes = [];
      this.searchQuery = '';
    }
  }

  loadNextRuntimes(): void {
    if (!this.triggerId) {
      return;
    }

    this.loading = true;
    const request: NextRuntimesRequestDto = {
      triggerId: this.triggerId,
      fromUtc: new Date().toISOString(),
      count: this.count,
    };

    this.triggerService
      .getNextRuntimesByRequest(request)
      .pipe(
        finalize(() => (this.loading = false)),
        handleError((err) => this.messageService.error(err.message))
      )
      .subscribe((runtimes) => {
        this.runtimes = runtimes.map((rt) => ({
          runTime: rt,
          displayTime: this.formatDateTime(rt),
        }));
        this.applyFilter();
      });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredRuntimes = [...this.runtimes];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredRuntimes = this.runtimes.filter(
        (rt) =>
          rt.runTime.toLowerCase().includes(query) ||
          rt.displayTime.toLowerCase().includes(query)
      );
    }
  }

  onReload(): void {
    this.loadNextRuntimes();
  }

  formatDateTime(utcString: string): string {
    try {
      const date = new Date(utcString);
      return date.toLocaleString();
    } catch {
      return utcString;
    }
  }
}
