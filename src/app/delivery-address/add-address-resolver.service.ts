import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddAddressResolverService implements Resolve<any> {

  constructor(private authService: AuthService) { }
  // resolvedAddress
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const addressId = route.params.addressId;
    if (addressId !== '') {
      return this.authService.getDelievryAddressById(addressId)
      .pipe(
        map(customerAddressResolver => (
          // console.log(customerAddressResolver),
          { customerAddress: customerAddressResolver.addressInfo[0], error: '' }
        )),
        catchError(error => {
          const message = `Retrieval error: ${error}`;
          //   console.log(message);
          return of({ customerAddress: null, error: message });
        })
      );
    }
    return of([]);
    // this.authService.getDelievryAddressById(addressId).subscribe(addressinfo => {
    // });
    // console.log('resolver service' + addressId);
    // console.log(route.params);
    // return of([]);
  }
}
