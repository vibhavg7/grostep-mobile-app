import { Injectable } from '@angular/core';
import { Product } from '../store/store-categories/products/product.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable, from, of, throwError } from 'rxjs';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;
import * as _ from 'lodash';
import { tap, catchError, map } from 'rxjs/operators';


export class CartItem {
  // tslint:disable-next-line:variable-name
  store_product_mapping_id: number;
  // tslint:disable-next-line:variable-name
  product_name: string;
  // tslint:disable-next-line:variable-name
  store_selling_price: number;
  weight: number;
  // tslint:disable-next-line:variable-name
  store_id: any;
  // tslint:disable-next-line:variable-name
  weight_text: string;
  // tslint:disable-next-line:variable-name
  image_url: string;
  // tslint:disable-next-line:variable-name
  store_name: string;
  // tslint:disable-next-line:variable-name
  store_city: string;

  // tslint:disable-next-line:variable-name
  store_latitude: string;

  // tslint:disable-next-line:variable-name
  store_longitude: string;

  quantity: number;

  stock: number;
  // tslint:disable-next-line:variable-name
  store_product_caping: number;
  // tslint:disable-next-line:variable-name
  store_product_status: number;
  // tslint:disable-next-line:variable-name
  product_marked_price: number;
  constructor(item?: Product, quantity?: number) {
    this.store_product_mapping_id = item.store_product_mapping_id;
    this.product_name = item.product_name;
    this.store_selling_price = item.store_selling_price;
    this.image_url = item.image_url;
    this.weight = item.weight;
    this.store_name = item.store_name;
    this.weight_text = item.weight_text;
    this.quantity = quantity;
    this.store_id = item.store_id;
    this.store_city = item.store_city;
    this.store_latitude = item.store_latitude;
    this.store_longitude = item.store_longitude;
    this.stock = item.stock;
    this.store_product_caping = item.store_product_caping;
    this.store_product_status = item.store_product_status;
    this.product_marked_price = item.product_marked_price;
  }
}

export interface Voucher {
  voucher_id: string;
  voucher_code: string;
  voucher_amount: number;
  added_date: string;
  last_updated: string;
  status: number;
  voucher_cart_amount: number;
  voucher_type: number;
  expiry_datetime: string;
  image_url: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  list: Array<CartItem>;
  private deliveryCharge = 0;
  private subject = new Subject<any>();
  private voucher: Voucher = {} as Voucher;
  private voucherAmount = 0;
  private CUSTOMER_ID = 'customerid';
  private cartServiceUrl = 'http://localhost:3000/cartapi/';
  constructor(
    private httpClient: HttpClient) {
    this.list = [];
  }

  sendMessage(cartList) {
    this.subject.next({ text: cartList.count });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getAllCartItems(): Observable<any> {
    return from(Storage.get({ key: 'cartList' }));
  }

  // getCartCount() {
  //   return this.list.length;
  // }

  removeVoucher() {
    this.removeVoucherItem();
    this.voucher = {} as Voucher;
    return this.voucher;
  }

  removeAllCartItems() {
    this.removeCartItem();
    this.list = [];
    this.sendMessage(this.list);
    return this.list;
  }

  async removeCartItem() {
    await Storage.remove({ key: 'cartList' });
    const ret1 = await Storage.get({ key: 'cartList' });
    // console.log(ret1);
    const cartval = JSON.parse(ret1.value);
    // console.log(cartval);
    // delete cartval.items; delete cartval.count; delete cartval.total;
    // this.setCartObject(JSON.parse(cartval));
    // await Storage.remove({ key: 'cartList' });
  }
  async removeVoucherItem() {
    await Storage.remove({ key: 'voucherCode' });
  }

  // getItemById(id: any) {
  //   // tslint:disable-next-line:prefer-for-of
  //   for (let i = 0; i < this.list.length; i++) {
  //     if (this.list[i].store_product_mapping_id === id) {
  //       return this.list[i];
  //     }
  //   }
  // }

  // addItem(item: Product, quantity: number) {
  //   const id = item.store_product_mapping_id;
  //   let isExists = false;
  //   from(Storage.get({ key: 'cartList' })).subscribe((data) => {
  //     const parsedData = JSON.parse(data.value);
  //     if (parsedData !== null) {
  //       // tslint:disable-next-line:prefer-for-of
  //       for (let i = 0; i < parsedData.length; i++) {
  //         if (parsedData[i].id === id) {
  //           parsedData[i].quantity += quantity;
  //           isExists = true;
  //           this.setCartObject(parsedData);
  //         } else {
  //           isExists = false;
  //         }
  //       }
  //       if (!isExists) {
  //         parsedData.push(new CartItem(item, quantity));
  //         this.setCartObject(parsedData);
  //       }
  //     } else {
  //       this.list.push(new CartItem(item, quantity));
  //       this.setCartObject(parsedData);
  //     }
  //   });
  // }

  // async getCartObject() {
  //   const ret = await Storage.get({ key: 'cartList' });
  //   const cart = JSON.parse(ret.value);
  //   return cart;
  // }

  async setCartObject(cartList) {
    await Storage.set({
      key: 'cartList',
      value: JSON.stringify(cartList)
    });
    // console.log(cartList);
    this.sendMessage(cartList);
  }

  async setVoucherObject(voucher) {
    await Storage.set({
      key: 'voucherCode',
      value: JSON.stringify(voucher)
    });
  }

  // removeItem(item: Product, quantity: number) {
  //   const id = item.store_product_mapping_id;
  //   from(Storage.get({ key: 'cartList' })).subscribe((data) => {
  //     const parsedData = JSON.parse(data.value);
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let i = 0; i < parsedData.length; i++) {
  //       if (parsedData[i].id === id) {
  //         if (parsedData[i].quantity === 1) {
  //           parsedData.splice(i, 1);
  //         } else {
  //           parsedData[i].quantity -= quantity;
  //         }
  //         break;
  //       }
  //     }
  //     this.setCartObject(parsedData);
  //   });
  // }


  // removeItemById(id) {
  //   from(Storage.get({ key: 'cartList' })).subscribe((data) => {
  //     const parsedData = JSON.parse(data.value);
  //     // tslint:disable-next-line:prefer-for-of
  //     for (let i = 0; i < parsedData.length; i++) {
  //       if (parsedData[i].id === id) {
  //         if (parsedData[i].quantity === 1) {
  //           parsedData.splice(i, 1);
  //         }
  //         break;
  //       }
  //     }
  //     this.sendMessage(parsedData);
  //     this.setCartObject(parsedData);
  //   });
  //   // for (let i = 0; i < this.list.length; i++) {
  //   //   if (this.list[i].id === id) {
  //   //     this.list.splice(i, 1);
  //   //     // console.log('Hey');
  //   //     this.sendMessage(this.list);
  //   //     break;
  //   //   }
  //   // }
  // }

  // quantityPlus(item) {
  //   item.quantity += 1;
  // }

  // quantityMinus(item) {
  //   item.quantity -= 1;
  // }

  getDeliveryCharge(): number {
    return this.deliveryCharge;
  }

  setDeliveryCharge(value) {
    this.deliveryCharge = value;
  }

  setVoucher(voucher) {
    this.voucher = voucher;
    this.setVoucherObject(voucher);
  }

  getvoucherAmount() {
    return _.isEmpty(this.voucher) ? 0 : this.voucher.voucher_amount;
  }

  getAppliedVoucher(): Observable<any> {
    // return this.voucher;
    return from(Storage.get({ key: 'voucherCode' }));
  }

  getGrandTotal(): number {
    let amount = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.list.length; i++) {
      const productPrice: any = this.list[i].store_selling_price;

      amount += (productPrice * this.list[i].quantity);
    }
    return amount;
  }
  // customerId
  syncCartProducts(cartValue, cartId?, deliveryInstructions?, selectedDeliveryAddressId ?) {
    const obj: any = {};
    const customerId = +localStorage.getItem(this.CUSTOMER_ID);
    obj.customer_id = customerId;
    obj.items = cartValue;
    obj.deliveryInstructions = deliveryInstructions;
    obj.delivery_address_id = selectedDeliveryAddressId;
    console.log(obj);
    console.log(cartId);
    if (cartId) {
      obj.id = cartId;
      return this.httpClient.put<any>(`${this.cartServiceUrl}cart/${cartId}`, obj)
        .pipe(
          tap(data => {
          })
          , map((data) => {
            return data;
          })
          , catchError(this.handleError)
        );
    } else {
      return this.httpClient.post<any[]>(`${this.cartServiceUrl}cart`, obj)
        .pipe(
          tap(data => {
          })
          , map((data) => {
            return data;
          })
          , catchError(this.handleError)
        );
    }
  }


  validateStoreCartProducts(cartValue, storeId) {
    const obj: any = {};
    obj.cartData = cartValue;
    obj.storeId = storeId;
    // console.log(obj);
    return this.httpClient.post<any[]>(`${this.cartServiceUrl}validateStoreCartProducts`, obj)
      .pipe(
        tap(data => {
        })
        , map((data) => {
          return data;
        })
        , catchError(this.handleError)
      );
  }



  // authenticateCartData(response: any): any {
  //   const list: Array<CartItem> = [];
  //   if (+response.status === 200) {
  //     if (response.customerCart != null && Array.isArray(response.customerCart) && response.customerCart.length > 0) {
  //       // this.removeAllCartItems();
  //       response.customerCart.forEach(element => {
  //         list.push(new CartItem(element, element.quantity));
  //       });
  //       const cartObj: any = {};
  //       cartObj.chargeableDeliveryCost = 0;
  //       cartObj.cartId = response.customerCart[0].cart_id;
  //       cartObj.count = list.length;
  //       cartObj.items = list;
  //       cartObj.paymentMode = null;
  //       cartObj.total = list.reduce((sum, current) => {
  //         return sum + current.store_selling_price;
  //       }, 0);
  //       this.setCartObject(cartObj);
  //       // this.cartService.sendMessage(list);
  //     }
  //     return response;
  //   } else {
  //     return response;
  //   }
  // }

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
