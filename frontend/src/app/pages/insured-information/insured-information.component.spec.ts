import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredInformationComponent } from './insured-information.component';

describe('InsuredInformationComponent', () => {
  let component: InsuredInformationComponent;
  let fixture: ComponentFixture<InsuredInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsuredInformationComponent]
    });
    fixture = TestBed.createComponent(InsuredInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
