import { ILocalizationService, StateActorTemplateDto } from '@eleon/angular-sdk.lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-state-actor-template-selection-dialog',
  templateUrl: './state-actor-template-selection-dialog.component.html',
  styleUrls: ['./state-actor-template-selection-dialog.component.scss']
})
export class StateActorTemplateSelectionDialogComponent implements OnInit {
  @Input()
  display: boolean = false;

  @Output()
  displayChange = new EventEmitter<boolean>();

  @Input()
  title: string;
  @Input()
  documentObjectType: string;
  @Output()
  saveEvent: EventEmitter<StateActorTemplateDto> = new EventEmitter<StateActorTemplateDto>();
  @Input()
  stateId: string;
  @Input()
  reviewer: boolean;
  @Input()
  stateActor: StateActorTemplateDto;

  constructor(
    public localizationService: ILocalizationService,
  ) { }

  ngOnInit(): void {
    return;
  }

  showDialog() {
      this.display = true;
  }

  save(event) {
    this.saveEvent.emit(event);
    this.display = false;
    this.displayChange.emit(this.display)
  }
}
