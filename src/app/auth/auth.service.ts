import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators/catchError';
import { CartService } from '../cart/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: any;
  customerInfo: any;
  private TOKEN_KEY = 'token';
  private CUSTOMER_ID = 'customerid';
  private customerdeliveryInfo: any = [];
  customerProfile: any;
  private customerServiceUrl = 'http://ec2-18-188-251-155.us-east-2.compute.amazonaws.com:3000/customerapi/';
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

  registerCustomer(phone: any) {
    const obj: any = {};
    obj.phone = phone;
    // console.log(obj);
    return this.httpClient.post<any[]>(`${this.customerServiceUrl}register`, obj)
      .pipe(
        tap(data => {
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
          console.log(data);
          return this.authenticate(data);
          // return data;
        })
        , catchError(this.handleError)
      );
  }

  getUserProfile() {
    const headerData = new Headers();
    this.createAuthorizationHeader(headerData);
    return this.httpClient.get(`${this.customerServiceUrl}customerinfo/${localStorage.getItem(this.CUSTOMER_ID)}`)
      .pipe(tap((data: any) => {
        console.log(data);
        this.customerdeliveryInfo = data.customer_delivery_addresses;
        this.customerProfile = data.customer_info[0];
      }), map((data) => {
        return data;
      }),
        catchError(this.handleError));
  }

  getDelievryAddressById(addressId) {
    console.log(addressId);
    return this.httpClient.get<any>(`${this.customerServiceUrl}customeraddress/${addressId}`)
      .pipe(
        tap(data => {
          // console.log(data);
        })
        , map((data) => {
          console.log(data);
          return data.addressInfo[0];
        })
        , catchError(this.handleError)
      );
  }

  getCustomerAddressesById() {
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    return this.httpClient.get<any>(`${this.customerServiceUrl}customeraddressoncart/${customerId}`)
      .pipe(
        tap(data => {
          // console.log(data);
        })
        , map((data) => {
          return data.addressInfo;
        })
        , catchError(this.handleError)
      );
  }

  editDelievryAddress(addressId, address) {
    return this.httpClient.put<any>(`${this.customerServiceUrl}customeraddress/${addressId}`, address)
      .pipe(
        tap(data => {
          // console.log(data);
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
        console.log(data);
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
          console.log(data);
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  selectDeliveryAddress(addressId) {
    const obj: any = {};
    obj.status = 1;
    return this.httpClient.put<any[]>(`${this.customerServiceUrl}customeraddress/selectaddress/${addressId}`, obj)
      .pipe(
        tap(data => {
          // console.log(data);
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }

  deleteDeliveryAddress(id) {
    return this.httpClient.delete<any>(`${this.customerServiceUrl}customeraddress/${id}`)
      .pipe(
        tap(data => {
          // console.log(data);
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
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' +
      localStorage.getItem(this.TOKEN_KEY));
  }

  authenticate(response: any): any {
    if (response.status) {
      const token = response.token;
      const customer_id = response.customerData.customer_id;
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.CUSTOMER_ID, customer_id);
        return response;
      } else {
        return response;
      }
    } else {
      return response;
    }
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
