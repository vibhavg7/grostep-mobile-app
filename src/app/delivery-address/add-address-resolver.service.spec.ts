import { TestBed } from '@angular/core/testing';

import { AddAddressResolverService } from './add-address-resolver.service';

describe('AddAddressResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddAddressResolverService = TestBed.get(AddAddressResolverService);
    expect(service).toBeTruthy();
  });
});
