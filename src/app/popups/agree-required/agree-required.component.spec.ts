import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreeRequiredComponent } from './agree-required.component';

describe('AgreeRequiredComponent', () => {
  let component: AgreeRequiredComponent;
  let fixture: ComponentFixture<AgreeRequiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgreeRequiredComponent]
    });
    fixture = TestBed.createComponent(AgreeRequiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
