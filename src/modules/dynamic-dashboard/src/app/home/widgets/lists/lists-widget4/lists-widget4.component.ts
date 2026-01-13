import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-lists-widget4',
  templateUrl: './lists-widget4.component.html',
})
export class ListsWidget4Component {
  @Input() items: number = 6;
  constructor() {}
}
