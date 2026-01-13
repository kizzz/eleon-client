import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogHeaderService {
  private titleSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  getTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }

  setTitle(title: string): void {
    this.titleSubject.next(title);
  }
}
