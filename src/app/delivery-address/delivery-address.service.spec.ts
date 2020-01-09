import { TestBed } from '@angular/core/testing';

import { DeliveryAddressService } from './delivery-address.service';

describe('DeliveryAddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeliveryAddressService = TestBed.get(DeliveryAddressService);
    expect(service).toBeTruthy();
  });
});
