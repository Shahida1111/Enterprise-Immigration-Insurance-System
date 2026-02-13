import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationSubmitComponent } from './quotation-submit.component';

describe('QuotationSubmitComponent', () => {
  let component: QuotationSubmitComponent;
  let fixture: ComponentFixture<QuotationSubmitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuotationSubmitComponent]
    });
    fixture = TestBed.createComponent(QuotationSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
