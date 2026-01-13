import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterModule, ChildActivationStart, ResolveEnd } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IModuleLoadingObservableService } from '@eleon/contracts.lib'

@Component({
  selector: 'ec-router-outlet',
  template: `
  <p-progressSpinner *ngIf="loaded | async" ariaLabel="Loading" />
  <router-outlet></router-outlet>
`,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ProgressSpinnerModule,
    ]
})
export class EcRouterOutletComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loaded: Observable<boolean>;

  constructor(public moduleLoading: IModuleLoadingObservableService) {
    this.loaded = this.moduleLoading.isModulesLoading();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
