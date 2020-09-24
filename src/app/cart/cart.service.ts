import { Injectable } from '@angular/core';
import { Product } from '../store/store-categories/products/product.model';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, from, of } from 'rxjs';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

export class CartItem {
  id: string;
  title: string;
  price: number;
  weight: number;
  // tslint:disable-next-line:variable-name
  store_id: any;
  // tslint:disable-next-line:variable-name
  weight_text: string;
  // tslint:disable-next-line:variable-name
  product_img: string;
  // tslint:disable-next-line:variable-name
  store_name: string;
  // tslint:disable-next-line:variable-name
  store_city: string;
  quantity: number;
  constructor(item: Product, quantity: number) {
      this.id = item.store_product_mapping_id;
      this.title = item.product_name;
      this.price = item.store_selling_price;
      this.product_img = item.image_url;
      this.weight = item.weight;
      this.store_name = item.store_name;
      this.weight_text = item.weight_text;
      this.quantity = quantity;
      this.store_id = item.store_id;
      this.store_city = item.store_city;
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
  constructor(
    private httpClient: HttpClient) {
    this.list = [];
  }

  sendMessage(cartList) {
    this.subject.next({ text: cartList.length });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getAllCartItems(): Observable<any> {
    return from(Storage.get({ key: 'cartList' }));
  }

  getCartCount() {
    return this.list.length;
  }

  // getStorageCartCount() {
  //   return this.storage.get('cartstoragedata');
  // }

  // checkEmptyCart() {
  //   return this.list.length === 0 ? true : false;
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
  }
  async removeVoucherItem() {
    await Storage.remove({ key: 'voucherCode' });
  }

  getItemById(id: any) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        return this.list[i];
      }
    }
  }

  addItem(item: Product, quantity: number) {
    const id = item.store_product_mapping_id;
    let isExists = false;
    from(Storage.get({ key: 'cartList' })).subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      if (parsedData !== null) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < parsedData.length; i++) {
          if (parsedData[i].id === id) {
            parsedData[i].quantity += quantity;
            isExists = true;
            this.setCartObject(parsedData);
          } else {
            isExists = false;
          }
        }
        if (!isExists) {
          parsedData.push(new CartItem(item, quantity));
          this.setCartObject(parsedData);
        }
      } else {
        this.list.push(new CartItem(item, quantity));
        this.setCartObject(parsedData);
      }
    });
  }

  async getCartObject() {
    const ret = await Storage.get({ key: 'cartList' });
    const cart = JSON.parse(ret.value);
    return cart;
  }

  async setCartObject(cartList) {
    await Storage.set({
      key: 'cartList',
      value: JSON.stringify(cartList)
    });
  }

  async setVoucherObject(voucher) {
    await Storage.set({
      key: 'voucherCode',
      value: JSON.stringify(voucher)
    });
  }

  removeItem(item: Product, quantity: number) {
    const id = item.store_product_mapping_id;
    from(Storage.get({ key: 'cartList' })).subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].id === id) {
          if (parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          } else {
            parsedData[i].quantity -= quantity;
          }
          break;
        }
      }
      this.setCartObject(parsedData);
    });
  }


  removeItemById(id) {
    from(Storage.get({ key: 'cartList' })).subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].id === id) {
          if (parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          }
          break;
        }
      }
      this.sendMessage(parsedData);
      this.setCartObject(parsedData);
    });
    // for (let i = 0; i < this.list.length; i++) {
    //   if (this.list[i].id === id) {
    //     this.list.splice(i, 1);
    //     // console.log('Hey');
    //     this.sendMessage(this.list);
    //     break;
    //   }
    // }
  }

  quantityPlus(item) {
    item.quantity += 1;
  }

  quantityMinus(item) {
    item.quantity -= 1;
  }

  getDeliveryCharge(): number {
    return this.deliveryCharge;
  }

  setDeliveryCharge(value) {
    console.log(value);
    this.deliveryCharge = value;
  }

  setVoucher(voucher) {
    this.voucher = voucher;
    this.setVoucherObject(voucher);
  }

  getvoucherAmount() {
    return this.voucher.voucher_amount ? this.voucher.voucher_amount : 0;
  }

  getAppliedVoucher(): Observable<any> {
    // return this.voucher;
    return from(Storage.get({ key: 'voucherCode' }));
  }

  getGrandTotal(): number {
    let amount = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.list.length; i++) {
      const productPrice: any = this.list[i].price;

      amount += (productPrice * this.list[i].quantity);
    }
    return amount;
  }
}
