import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-mixed-widget1',
  templateUrl: './mixed-widget1.component.html',
})
export class MixedWidget1Component {
  @Input() color: string = '';
  constructor() {}
}
