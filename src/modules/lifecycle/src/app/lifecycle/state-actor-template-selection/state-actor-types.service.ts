import { ILocalizationService, LifecycleActorTypes } from '@eleon/angular-sdk.lib';
import { Injectable } from '@angular/core';
import { StateActorTypeOption } from './state-actor-types-option';

@Injectable({
  providedIn: 'root'
})
export class StateActorTypesService {

  constructor(
    public localizationService: ILocalizationService
  ) { }

  getSelectionTypes() {
    return [
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:User'),
        value: LifecycleActorTypes.User,
        severity: 'primary'
      },
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:Role'),
        value: LifecycleActorTypes.Role,
        severity: 'warning'
      },
    ]
  }

  getTypes() {
    return [
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:User'),
        value: LifecycleActorTypes.User,
        severity: 'primary'
      },
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:Role'),
        value: LifecycleActorTypes.Role,
        severity: 'warning'
      },
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:Beneficiary'),
        value: LifecycleActorTypes.Beneficiary,
        severity: 'danger',
      },
      {
        name: this.localizationService.instant('Lifecycle::States:Actors:Type:Initiator'),
        value: LifecycleActorTypes.Initiator,
        severity: 'success',
      },
    ];
  }

  recognizeActorType(type){
    let state = {} as StateActorTypeOption;
    if(type == LifecycleActorTypes.Beneficiary){
      state.name = this.localizationService.instant('Lifecycle::States:Actors:Type:Beneficiary');
        state.value = LifecycleActorTypes.Beneficiary,
        state.severity = 'danger';
    } else if(type == LifecycleActorTypes.Initiator){
        state.name = this.localizationService.instant('Lifecycle::States:Actors:Type:Initiator');
        state.value = LifecycleActorTypes.Initiator,
        state.severity = 'success';
    } else if(type == LifecycleActorTypes.Role){
      state.name = this.localizationService.instant('Lifecycle::States:Actors:Type:Role');
      state.value = LifecycleActorTypes.Role,
      state.severity = 'warning';
    } else if(type == LifecycleActorTypes.User){
      state.name = this.localizationService.instant('Lifecycle::States:Actors:Type:User');
      state.value = LifecycleActorTypes.User,
      state.severity = 'primary';
    }
    return state;
  }
}
