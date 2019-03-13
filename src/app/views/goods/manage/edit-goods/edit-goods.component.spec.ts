import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGoodsComponent } from './edit-goods.component';

describe('EditGoodsComponent', () => {
  let component: EditGoodsComponent;
  let fixture: ComponentFixture<EditGoodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGoodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
