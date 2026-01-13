import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiTenancyManagementComponent } from './multi-tenancy-management.component';

describe('MultiTenancyManagementComponent', () => {
  let component: MultiTenancyManagementComponent;
  let fixture: ComponentFixture<MultiTenancyManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiTenancyManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiTenancyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
