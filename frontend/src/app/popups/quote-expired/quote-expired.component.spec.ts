import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteExpiredComponent } from './quote-expired.component';

describe('QuoteExpiredComponent', () => {
  let component: QuoteExpiredComponent;
  let fixture: ComponentFixture<QuoteExpiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuoteExpiredComponent]
    });
    fixture = TestBed.createComponent(QuoteExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
