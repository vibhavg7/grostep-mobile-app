import { Component, OnInit } from '@angular/core';
import { CartService, CartItem, Voucher } from './cart.service';
import { AlertController, NavController } from '@ionic/angular';
import { Product } from '../store/store-categories/products/product.model';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  currentuser: any;
  categoryId: string;
  storeId: number;
  totalAmount: number;
  deliveryCharge = 0;
  voucherAmount: number;
  cartList: Array<CartItem>;
  addressCount: number;
  voucher: Voucher;
  selectedAddress: any;
  cartCategories: Array<string> = [];
  isLoading = false;
  constructor(
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private auth: AuthService,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
    this.currentuser = this.auth.isauthenticated;
    this.cartList = this.cartService.getAllCartItems();
    console.log(this.cartList);
    this.voucher = this.cartService.getAppliedVoucher();
    this.voucher = this.cartService.getAppliedVoucher();
    if (this.storeId === 0) {
      this.storeId = this.cartList[0].store_id;
    }
    console.log(this.storeId);
    this.auth.getCustomerAddressesById().subscribe((data: any) => {
      this.selectedAddress = data.filter((address: any) => {
        return address.status === 1;
      })[0];
      this.addressCount = data.length;
    });
  }

  quantityMinus(item) {
    if (item.quantity > 1) {
      this.cartService.quantityMinus(item);
    } else {
      this.alertCtrl
        .create({
          header: 'Cart Error',
          message: 'You can\'t reduce the quantity below 1. If you want to remove, please press remove button.',
          buttons: ['Okay']
        })
        .then(alertEl => alertEl.present());
    }
  }

  addAddress() {
    this.router.navigate(['/', 'delivery-address', 'add-delivery-address', { addressId: '', prevPage: 'cartpage'}]);
  }

  removeVoucher(voucherid) {
    this.voucher = {} as Voucher;
    this.cartService.removeVoucher();
  }

  changeAddress() {
    this.router.navigate(['/delivery-address', { storeId: this.storeId, prevPage: 'cartpage'}]);
  }

  quantityPlus(item) {
    this.cartService.quantityPlus(item);
  }

  applyVoucher() {
    this.router.navigate(['/offer', { storeId: this.storeId, prevPage: 'cartpage'}]);
  }

  getTotal(): number {
    this.totalAmount = this.cartService.getGrandTotal();
    return this.totalAmount;
  }

  // getDeliveryCharge(): number {
  //   return this.cartService.getDeliveryCharge();
  // }

  getPayableAmount() {
    // + this.getDeliveryCharge()
    return this.totalAmount  - this.getVoucherAmount();
  }

  getVoucherAmount() {
    return this.cartService.getvoucherAmount();
  }

  continueShopping() {
    if (this.storeId !== 0) {
      this.navCtrl.navigateBack(`/categories/${this.categoryId}/stores/${this.storeId}/storecategories`);
    } else {
      this.navCtrl.navigateRoot('home/tabs/categories');
    }
  }

  login() {
    this.auth.redirectUrl = 'cartpage';
    this.router.navigate(['/auth/login', { storeId: this.storeId}]);
  }

  removeItemFromCart(item) {
    this.alertCtrl
      .create({
        header: 'Cart Error',
        message: 'You can\'t reduce the quantity below 1. If you want to remove, please press remove button.',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'cancelcss',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Remove',
            cssClass: 'removecss',
            handler: () => {
              console.log('Remove clicked');
              console.log(item.id);
              this.cartService.removeItemById(item.id);
              this.cartList = this.cartService.getAllCartItems();
              if ((this.cartList.length < 1) || (this.cartService.getGrandTotal() < this.voucher.voucher_cart_amount)) {
                this.voucher = {} as Voucher;
                this.cartService.removeVoucher();
              }
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  addDeliveryOptions() {
    if (this.auth.isauthenticated == null || this.auth.isauthenticated === false ) {
      this.auth.redirectUrl = 'cartpage';
      this.router.navigate(['/', 'auth', 'login']);
    } else {
      this.router.navigate(['/', 'delivery-address', 'delivery-options', this.storeId]);
    }
  }
}
