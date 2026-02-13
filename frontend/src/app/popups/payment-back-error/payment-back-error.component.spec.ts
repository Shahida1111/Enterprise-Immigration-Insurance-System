import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentBackErrorComponent } from './payment-back-error.component';

describe('PaymentBackErrorComponent', () => {
  let component: PaymentBackErrorComponent;
  let fixture: ComponentFixture<PaymentBackErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentBackErrorComponent]
    });
    fixture = TestBed.createComponent(PaymentBackErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
