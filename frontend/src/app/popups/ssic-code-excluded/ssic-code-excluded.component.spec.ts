import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsicCodeExcludedComponent } from './ssic-code-excluded.component';

describe('SsicCodeExcludedComponent', () => {
  let component: SsicCodeExcludedComponent;
  let fixture: ComponentFixture<SsicCodeExcludedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SsicCodeExcludedComponent]
    });
    fixture = TestBed.createComponent(SsicCodeExcludedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
