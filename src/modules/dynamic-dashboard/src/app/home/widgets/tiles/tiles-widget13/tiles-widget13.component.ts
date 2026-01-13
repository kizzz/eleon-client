import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tiles-widget13',
  templateUrl: './tiles-widget13.component.html',
})
export class TilesWidget13Component {
  @Input() cssClass = '';
  @Input() widgetHeight = '225px';

  constructor() {}
}
