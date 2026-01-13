import { Injectable } from '@angular/core';
import { GatewayDto } from '@eleon/gateway-management-proxy';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GatewayAngularService {
  private editClickedSource = new BehaviorSubject<boolean>(false);
  editClicked$: Observable<boolean> = this.editClickedSource.asObservable();

  private cancelEditClickedSource = new BehaviorSubject<boolean>(false);
  cancelEditClicked$: Observable<boolean> = this.cancelEditClickedSource.asObservable();

  private saveClickedSource = new BehaviorSubject<boolean>(false);
  saveClicked$: Observable<boolean> = this.saveClickedSource.asObservable();

  setEditModeClicked(value: boolean) {
    this.editClickedSource.next(value);
  }

  setCancelEditModeClicked(value: boolean) {
    this.cancelEditClickedSource.next(value);
  }

  saveClicked(value: boolean) {
    this.saveClickedSource.next(value);
  }
}