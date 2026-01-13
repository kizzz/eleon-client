import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateFromFileComponent } from './user-create-from-file.component';

describe('UserCreateFromFileComponent', () => {
  let component: UserCreateFromFileComponent;
  let fixture: ComponentFixture<UserCreateFromFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreateFromFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserCreateFromFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
