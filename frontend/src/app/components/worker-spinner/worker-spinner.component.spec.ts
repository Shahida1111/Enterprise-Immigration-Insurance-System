import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerSpinnerComponent } from './worker-spinner.component';

describe('SpinnerComponent', () => {
  let component: WorkerSpinnerComponent;
  let fixture: ComponentFixture<WorkerSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkerSpinnerComponent]
    });
    fixture = TestBed.createComponent(WorkerSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
