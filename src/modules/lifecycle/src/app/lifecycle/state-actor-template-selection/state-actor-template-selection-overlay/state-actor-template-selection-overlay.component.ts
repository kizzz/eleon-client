import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StateActorTemplateDto } from '@eleon/angular-sdk.lib';

@Component({
  standalone: false,
  selector: 'app-state-actor-template-selection-overlay',
  templateUrl: './state-actor-template-selection-overlay.component.html',
  styleUrls: ['./state-actor-template-selection-overlay.component.scss']
})
export class StateActorTemplateSelectionOverlayComponent implements OnInit {
  @Input()
  title: string;
  @Input()
  documentObjectType: string;
  @Output()
  saveEvent: EventEmitter<StateActorTemplateDto> = new EventEmitter<StateActorTemplateDto>();

  constructor() { }

  ngOnInit(): void {
    return;
  }

}
