import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationUnitsDashboardComponent } from './organization-units-dashboard.component';

describe('OrganizationUnitsDashboardComponent', () => {
  let component: OrganizationUnitsDashboardComponent;
  let fixture: ComponentFixture<OrganizationUnitsDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationUnitsDashboardComponent]
    });
    fixture = TestBed.createComponent(OrganizationUnitsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
