import { Injectable } from '@angular/core';
import { Product } from '../store/store-categories/products/product.model';
import { HttpClient } from '@angular/common/http';

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
  quantity: number;
  constructor(item: Product, quantity: number) {
      this.id = item.store_product_mapping_id;
      this.title = item.product_name;
      this.price = item.store_selling_price;
      this.product_img = item.image_url;
      this.weight = item.weight;
      this.weight_text = item.weight_text;
      this.quantity = quantity;
      this.store_id = item.store_id;
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
  private voucher: Voucher = {} as Voucher;
  private voucherAmount = 0;
  constructor(private httpClient: HttpClient) {
    this.list = [];
  }

  getAllCartItems() {
    return this.list;
  }

  getCartCount() {
    return this.list.length;
  }

  checkEmptyCart() {
    return this.list.length === 0 ? true : false;
  }

  removeVoucher() {
    this.voucher = {} as Voucher;
  }

  getcartproductQuantity(product: Product): number {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === product.store_product_mapping_id) {
        return this.list[i].quantity;
      }
    }
    return 0;
  }

  removeAllCartItems() {
    this.list = [];
    return this.list;
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
    let isExists = false;
    const id = item.store_product_mapping_id;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        this.list[i].quantity += quantity;
        this.list[i].price = this.list[i].price;
        isExists = true;
        break;
      }
    }
    if (!isExists) {
      this.list.push(new CartItem(item, quantity));
    }
    console.log(this.list);
  }

  removeItem(item: Product, quantity: number) {
    let isExists = false;
    const id = item.store_product_mapping_id;
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        if (this.list[i].quantity === 1) {
          this.list.splice(i, 1);
        } else {
          this.list[i].quantity -= quantity;
        }
        isExists = true;
        break;
      }
    }
  }


  removeItemById(id) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) {
        this.list.splice(i, 1);
        break;
      }
    }
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
    this.deliveryCharge = value;
  }

  setVoucher(voucher) {
    this.voucher = voucher;
  }

  getvoucherAmount() {
    return this.voucher.voucher_amount ? this.voucher.voucher_amount : 0;
  }

  getAppliedVoucher() {
    return this.voucher;
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
