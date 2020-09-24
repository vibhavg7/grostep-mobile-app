import { TestBed } from '@angular/core/testing';

import { NetworkInterceptorService } from './network-interceptor.service';

describe('NetworkInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NetworkInterceptorService = TestBed.get(NetworkInterceptorService);
    expect(service).toBeTruthy();
  });
});
