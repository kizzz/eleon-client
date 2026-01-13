import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  Input,
  ContentChild,
} from "@angular/core";
import { ILocalizationService } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: "app-widget-selection-dialog",
  templateUrl: "./widget-selection-dialog.component.html",
  styleUrls: ["./widget-selection-dialog.component.scss"],
})
export class WidgetSelectionDialogComponent implements OnInit {
  @Input()
  public beforeButton: TemplateRef<any>;
  @Input()
  public notDisplayWidgets: string[] = [];
  @Output()
  selectEvent: EventEmitter<any> = new EventEmitter<any>();
  display: boolean = false;
  @ContentChild(TemplateRef)
  public button: TemplateRef<any>;
  loading: boolean;
  title: string = null;
  selectedWidget: string = null;
  localizedWidgets: { value: string; name: string }[];

  constructor(public localizationService: ILocalizationService) {
    if (!this.title) {
      this.title = this.localizationService.instant(
        "Infrastructure::WidgetSelection"
      );
    }
  }
  ngOnInit(): void {
    return;
  }

  showDialog() {
    this.display = true;
    this.localizedWidgets = [
      "BestSelling",
      "Comments",
      "Customers",
      "Notifications",
      "Orders",
      "RecentSales",
      "Revenue",
      "SalesOverview",
    ].map((value) => ({
      value: value,
      name: this.localizationService.instant(
        `Infrastructure::DashboardWidget:${[value]}`
      ),
    }));

    if (this.notDisplayWidgets?.length > 0) {
      this.localizedWidgets = this.localizedWidgets.filter(
        (widget) => !this.notDisplayWidgets.includes(widget.value)
      );
    }
  }

  closeDialog() {
    this.display = false;
  }

  select() {
    this.selectEvent.emit(this.selectedWidget);
    this.display = false;
  }
}
