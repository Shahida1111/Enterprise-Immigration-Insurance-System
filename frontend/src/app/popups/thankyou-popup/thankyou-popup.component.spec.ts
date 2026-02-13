import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankyouPopupComponent } from './thankyou-popup.component';

describe('ThankyouPopupComponent', () => {
  let component: ThankyouPopupComponent;
  let fixture: ComponentFixture<ThankyouPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThankyouPopupComponent]
    });
    fixture = TestBed.createComponent(ThankyouPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
