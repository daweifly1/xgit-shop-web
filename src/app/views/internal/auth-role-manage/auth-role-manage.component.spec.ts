import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRoleManageComponent } from './auth-role-manage.component';

describe('AuthRoleManageComponent', () => {
  let component: AuthRoleManageComponent;
  let fixture: ComponentFixture<AuthRoleManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
