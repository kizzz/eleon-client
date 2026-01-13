import { Injectable } from '@angular/core';
import { IBreadcrumbsService } from '@eleon/contracts.lib'
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbsService extends IBreadcrumbsService {
  private breadcrumbsSubject = new BehaviorSubject<{ label: string }[]>([]);
  override readonly breadcrumbs$: Observable<{ label: string }[]> = this.breadcrumbsSubject.asObservable();

  history: string[] = [];

  override setBreadcrumbs(breadcrumbs: { label: string }[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  override setLastPage(page: string) {
    this.history.push(page);
  }

  override removePage(page: string) {
    this.history = this.history?.filter(p => p !== page) || [];
  }

  override back() {
    if (this.history?.length > 1) {
      const lastPage = this.history[this.history.length - 2];
      this.history = this.history.slice(0,this.history.length-2);
      return lastPage;
    }
    return null;
  }
}
