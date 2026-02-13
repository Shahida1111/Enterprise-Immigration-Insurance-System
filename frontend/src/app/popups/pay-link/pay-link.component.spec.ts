import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayLinkComponent } from './pay-link.component';

describe('PayLinkComponent', () => {
  let component: PayLinkComponent;
  let fixture: ComponentFixture<PayLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayLinkComponent]
    });
    fixture = TestBed.createComponent(PayLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
