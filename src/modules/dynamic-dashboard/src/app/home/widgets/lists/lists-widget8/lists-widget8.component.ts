import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-lists-widget8',
  templateUrl: './lists-widget8.component.html',
})
export class ListsWidget8Component {
  @Input() cssClass = '';
  constructor() {}
}
