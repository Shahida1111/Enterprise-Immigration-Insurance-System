import { TestBed } from '@angular/core/testing';

import { immigrationService } from './immigration.service';

describe('immigrationService', () => {
  let service: immigrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(immigrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
