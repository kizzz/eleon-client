import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LifecycleService {
  private addWorkFlowRowClickedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public addWorkFlowRowClicked$: Observable<boolean> = this.addWorkFlowRowClickedSubject.asObservable();
  //public addStateRowClicked$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private isEditingSomeRow: boolean = false;


  private addStateRowClickedSubject = new BehaviorSubject<string>(null);
  addStateRowClicked$ = this.addStateRowClickedSubject.asObservable();

  constructor() {}

  addWorkFlowRowClicked(value: boolean) {
    this.addWorkFlowRowClickedSubject.next(value);
  }

  setIsEditing(isEditing: boolean): void {
    this.isEditingSomeRow = isEditing;
  }

  getIsEditing(): boolean {
    return this.isEditingSomeRow;
  }

  addStateRowClicked(statesGroupId: string): void {
    this.addStateRowClickedSubject.next(statesGroupId);
  }
}