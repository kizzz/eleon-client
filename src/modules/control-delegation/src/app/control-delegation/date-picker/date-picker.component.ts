import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { parseUtc } from "@eleon/angular-sdk.lib";

@Component({
  standalone: false,
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.scss"],
})
export class DatePickerComponent implements OnChanges {
  date: Date | Date[];

  @Input()
  value: string;
  @Output()
  valueChange = new EventEmitter<string>();

  @Input()
  from: string;
  @Output()
  fromChange = new EventEmitter<string>();

  @Input()
  to: string;
  @Output()
  toChange = new EventEmitter<string>();

  @Input()
  mode: "single" | "range" = "single";

  @Input()
  showTime: boolean = false;

  @Input()
  invalid: boolean = false;

  onDatePicked(date: Date | Date[]): void {
    if (this.mode === "single") {
      this.value = (date as Date).toISOString();
      this.valueChange.emit(this.value);
    } else if (this.mode === "range") {
      this.from = (date as Date[])[0].toISOString();
      this.to = (date as Date[])[1]?.toISOString();
      this.fromChange.emit(this.from);
      this.toChange.emit(this.to);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.date = parseUtc(changes['value'].currentValue);
    }

    if (changes['from'] || changes['to']) {
      if (this.from && this.to) {
        this.date = [parseUtc(this.from), parseUtc(this.to)];
      } else if (!!this.from) {
        this.date = [parseUtc(this.from)];
      }
    }
  }
}
