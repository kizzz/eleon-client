import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModulesManagementComponent } from './modules-management.component';

describe('ModulesManagementComponent', () => {
  let component: ModulesManagementComponent;
  let fixture: ComponentFixture<ModulesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
