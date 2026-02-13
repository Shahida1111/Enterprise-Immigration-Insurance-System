import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectRestrictComponent } from './direct-restrict.component';

describe('DirectRestrictComponent', () => {
  let component: DirectRestrictComponent;
  let fixture: ComponentFixture<DirectRestrictComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectRestrictComponent]
    });
    fixture = TestBed.createComponent(DirectRestrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
