import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPopupComponent } from './session-popup.component';

describe('SessionPopupComponent', () => {
  let component: SessionPopupComponent;
  let fixture: ComponentFixture<SessionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionPopupComponent]
    });
    fixture = TestBed.createComponent(SessionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
