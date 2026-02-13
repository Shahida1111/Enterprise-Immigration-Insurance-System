import { TestBed } from '@angular/core/testing';

import { StmgService } from './stmg.service';

describe('StmgService', () => {
  let service: StmgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StmgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
