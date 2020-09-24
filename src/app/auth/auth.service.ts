import { Injectable } from '@angular/core';
import { Observable, throwError, forkJoin, of, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators/catchError';
import { CartService } from '../cart/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  long: any;
  lat: any;
  redirectUrl: any;
  customerInfo: any;
  private TOKEN_KEY = 'token';
  private city: any;
  private subject = new Subject<any>();
  private CUSTOMER_ID = 'customerid';
  private CUSTOMER_PHONE = 'customerphone';
  private customerdeliveryInfo: any = [];
  customerProfile: any;
  private customerServiceUrl = 'https://api.grostep.com/customerapi/';
  private orderServiceUrl = 'https://api.grostep.com/ordersapi/';
  constructor(private httpClient: HttpClient, private cartService: CartService) { }

  get isLoggedIn() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  get isauthenticated() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  get CustomerdeliveryInfo() {
    return this.customerdeliveryInfo;
  }

  set City(value) {
    this.city = value;
  }

  get City() {
    return this.city;
  }

  get Lat() {
    return this.lat;
  }

  set Lat(value) {
    this.lat = value;
  }

  get Long() {
    return this.long;
  }

  set Long(value) {
    this.long = value;
  }

  registerCustomer(phone: any, token: any) {
    const obj: any = {};
    obj.phone = phone;
    obj.token = token;
    return this.httpClient.post<any[]>(`${this.customerServiceUrl}register`, obj)
      .pipe(
        tap((data: any) => {
          this.customerInfo = data;
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  resendOTP(customerId) {
    return this.httpClient.get<any[]>(`${this.customerServiceUrl}resendOTP/${customerId}`)
      .pipe(
        tap((data: any) => {
          this.customerInfo = data;
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  loginCustomer(phone: any, otp: any) {
    const obj: any = {};
    obj.phone_number = phone;
    obj.otp_number = otp;
    return this.httpClient.post<any[]>(`${this.customerServiceUrl}validate`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return this.authenticate(data);
          // return data;
        })
        , catchError(this.handleError)
      );
  }

  // getAllPaymentMethod(city) {
  //   const obj: any = {};
  //   obj.city = city;
  //   return this.httpClient.post<any>(`${this.orderServiceUrl}customerpaymentmethodscitywise`, obj)
  //   .pipe(
  //     tap(data => {
  //       console.log(data);
  //     })
  //     , map((data) => {
  //       // console.log(data);
  //       return data;
  //       // return data.addressInfo[0];
  //     })
  //     , catchError(this.handleError)
  //   );
  // }

  getProfileAndPaymentMethodInfo(city) {
    const headerData = new Headers();
    this.createAuthorizationHeader(headerData);
    const obj: any = {};
    obj.city = city;
    const response1 = this.httpClient.get(`${this.customerServiceUrl}customerinfo/${localStorage.getItem(this.CUSTOMER_ID)}`);
    const response2 = this.httpClient.post<any>(`${this.orderServiceUrl}customerpaymentmethodscitywise`, obj);
    return forkJoin([response1, response2])
      .pipe(tap((data: any) => {
      }), map((data: any) => {
        return data;
      }));
  }

  getUserProfile(): Observable<any> {
    const headerData = new Headers();
    this.createAuthorizationHeader(headerData);
    if (!localStorage.getItem(this.TOKEN_KEY)) {
      return of({
        message: 'Customer not login',
        status: 401,
        customer_info: [],
        customer_delivery_addresses: []
      });
    } else {
      return this.httpClient.get(`${this.customerServiceUrl}customerinfo/${localStorage.getItem(this.CUSTOMER_ID)}`)
      .pipe(tap((data: any) => {
        this.customerdeliveryInfo = data.customer_delivery_addresses;
        this.customerProfile = data.customer_info[0];
      }), map((data) => {
        return data;
      }),
        catchError(this.handleError));
    }
  }

  getDelievryAddressById(addressId) {
    return this.httpClient.get<any>(`${this.customerServiceUrl}customeraddress/${addressId}`)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  getCustomerAddressesById(city1, pagenumber: number, pagesize: number) {
    const obj: any = {};
    obj.city = city1;
    obj.page_number = pagenumber;
    obj.page_size = pagesize;
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    return this.httpClient.post<any>(`${this.customerServiceUrl}customeraddressoncart/${customerId}`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  getSelectedCustomerAddressCityWise(city1) {
    const obj: any = {};
    obj.city = city1;
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    return this.httpClient.post<any>(`${this.customerServiceUrl}customerselectedaddresscitywise/${customerId}`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }


  getSelectedCustomerAddressCityWiseAndVoucher(city1) {
    const obj: any = {};
    obj.city = city1;
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    // return this.httpClient.post<any>(`${this.customerServiceUrl}customerselectedaddresscitywise/${customerId}`, obj)
    //   .pipe(
    //     tap(data => {
    //     })
    //     , map((data) => {
    //       return data;
    //     })
    //     , catchError(this.handleError)
    //   );
    const response1 = this.httpClient.post<any>(`${this.customerServiceUrl}customerselectedaddresscitywise/${customerId}`, obj);
    const response2 = this.cartService.getAppliedVoucher();
    return forkJoin([response1, response2])
      .pipe(tap((data: any) => {
      }), map((data: any) => {
        return data;
      }));
  }


  editDelievryAddress(addressId, address) {
    return this.httpClient.put<any>(`${this.customerServiceUrl}customeraddress/${addressId}`, address)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  editUserInfo(userinfo) {
    return this.httpClient.put<any>(`${this.customerServiceUrl}customerinfo/${localStorage.getItem(this.CUSTOMER_ID)}`, userinfo)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  addDelievryAddress(address) {
    return this.httpClient.post<any>(`${this.customerServiceUrl}customeraddress`, address)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  selectDeliveryAddress(addressId, city) {
    const obj: any = {};
    obj.status = 1;
    obj.customerId = localStorage.getItem(this.CUSTOMER_ID);
    obj.city = city;
    return this.httpClient.put<any[]>(`${this.customerServiceUrl}customeraddress/selectaddress/${addressId}`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  checkServiceLocation(city, state, country, zipcode) {
    const obj: any = {};
    obj.city = city; obj.state = state; obj.country = country; obj.zipcode = zipcode;
    return this.httpClient.post<any>(`${this.customerServiceUrl}authenticateservicelocation`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  getAddress(lat: number, lng: number) {
    return this.httpClient
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDFFx3DtmgkvXsMfIO08Z4MT0bBeSLbX-c&sensor=true`
      )
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData;
        })
      );
  }

  deleteDeliveryAddress(id) {
    return this.httpClient.delete<any>(`${this.customerServiceUrl}customeraddress/${id}`)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  logout() {
    this.cartService.removeAllCartItems();
    localStorage.removeItem(this.CUSTOMER_ID);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CUSTOMER_PHONE);
  }

  saveToken() {
    this.subject.next({ text: localStorage.getItem(this.TOKEN_KEY) });
  }

  getToken(): Observable<any> {
    return this.subject.asObservable();
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' +
      localStorage.getItem(this.TOKEN_KEY));
  }

  authenticate(response: any): any {
    if (response.status) {
      const token = response.token;
      const customer_id = response.customerData.customer_id;
      const phone = response.customerData.phone;
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.CUSTOMER_ID, customer_id);
        localStorage.setItem(this.CUSTOMER_PHONE, phone);
        this.saveToken();
        return response;
      } else {
        return response;
      }
    } else {
      return response;
    }
  }

   getInfo(value: any): Observable<any> {
    return of([
      {
        message: 'We would love to hear from you. You can reach us at one of our contact numbers' +
                  ' or at head office or through our email id provided.',
        email: 'gscutomercare@gmail.com',
        phone: [9821757754, 9458421001],
        timing: '9AM - 10PM',
        address: 'Indirapuram, Ghaziabad'
      }
    ]);
   }

   submitFeedback(feedback) {
    return this.httpClient.post<any>(`${this.customerServiceUrl}addCustomerFeedback`, feedback)
    .pipe(
      tap(data => {
      })
      , map((data) => {
        return data;
      })
      , catchError(this.handleError)
    );
   }


  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    // console.error(errorMessage);
    return throwError(errorMessage);
  }
}
