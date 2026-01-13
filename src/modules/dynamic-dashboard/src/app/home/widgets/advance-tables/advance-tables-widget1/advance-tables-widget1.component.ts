import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-advance-tables-widget1',
  templateUrl: './advance-tables-widget1.component.html',
})
export class AdvanceTablesWidget1Component {
  @Input() cssClass: '';
  constructor() {}
}
