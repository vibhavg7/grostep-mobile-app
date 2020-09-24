import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CartService, CartItem, Voucher } from './cart.service';
import { AlertController, NavController, ModalController, Platform, ToastController } from '@ionic/angular';
import { Product } from '../store/store-categories/products/product.model';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { OfferPage } from '../offer/offer.page';
import { Subscription } from 'rxjs';
import {
  Plugins
} from '@capacitor/core';
import { DeliveryAddressService } from '../delivery-address/delivery-address.service';
import { OfferListComponent } from '../shared/offer-list/offer-list.component';
import { StoreService } from '../store/store.service';

const { Storage } = Plugins;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit, OnDestroy {
  subscription: Subscription;
  city: any;
  currentuser: any;
  categoryId: string;
  storeId: number;
  totalAmount: number;
  deliveryCharge = 0;
  voucherAmount: number;
  cartStoreName: any;
  cartList: Array<CartItem>;
  addressCount: number;
  voucher: any = {};
  selectedAddress: any;
  cartCategories: Array<string> = [];
  isLoading = false;
  storeClosingStatus = 0;
  constructor(
    private cartService: CartService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private toastCtrl: ToastController,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private modalController: ModalController,
    private deliveryAddressService: DeliveryAddressService,
    private storeService: StoreService,
    private router: Router,
    private auth: AuthService,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    console.log('ngoninit');
    // this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    // this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/home/tabs/cart') {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
  }

  async getObject() {
    console.log('getObject');
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/home/tabs/cart') {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.city = JSON.parse(ret.value).city;
    this.currentuser = this.auth.isauthenticated;
    this.isLoading = true;
    this.cartService.getAllCartItems().subscribe((cartdata) => {
      this.cartList = JSON.parse(cartdata.value);
      if (this.cartList !== null && this.cartList.length > 0) {
        this.calculateTotalAmount(this.cartList);
        this.cartStoreName = this.cartList[0].store_name;
        if (this.currentuser) {
          this.auth.getSelectedCustomerAddressCityWiseAndVoucher(this.city).subscribe((data: any) => {
            this.isLoading = false;
            this.selectedAddress = data[0].addressInfo[0];
            this.addressCount = data[0].customer_address_count[0].customer_address_count;
            const voucher = JSON.parse(data[1].value);
            console.log(voucher);
            if (voucher != null) {
              this.voucher = voucher;
            } else {
              this.voucher = {};
            }
            // this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
            // this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
            // // this.voucher = this.cartService.getAppliedVoucher();
            if (this.storeId === 0 && this.cartList.length > 0) {
              this.storeId = this.cartList[0].store_id;
              this.storeService.storeClosingStatus(this.storeId).subscribe((data1: any) => {
                if (data1.status === 200) {
                  console.log(data1);
                  this.isLoading = false;
                  this.storeClosingStatus = +data1.storeInfo[0].closed;
                }
              });
            }
          });
        } else {
          this.isLoading = false;
          if (this.storeId === 0 && this.cartList.length > 0) {
            this.storeId = this.cartList[0].store_id;
            console.log(this.storeId);
            this.storeService.storeClosingStatus(this.storeId).subscribe((data1: any) => {
              if (data1.status === 200) {
                console.log(data1);
                this.isLoading = false;
                this.storeClosingStatus = +data1.storeInfo[0].closed;
              }
            });
          }
        }
      } else {
        this.isLoading = false;
      }
    });
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.subscription = this.auth.getToken().subscribe((message: any) => {
      console.log(message);
      console.log('giii');
      if (message.text !== '') {
        this.currentuser = true;
        this.getObject();
        console.log(this.currentuser);
      }
    });
    this.getObject();
  }

  ionVieWDidEnter() {
    console.log('ionVieWDidEnter');
  }

  backToHome() {
    if (this.router.url.split(';')[0] === '/home/tabs/cart') {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    } else {
      this.navCtrl.pop();
    }
  }

  quantityMinus(item) {
    if (item.quantity > 1) {
      this.removeItemById(item.id);
      // if ((this.cartService.getGrandTotal() < this.voucher.voucher_cart_amount)) {
      //   this.voucher = {} as Voucher;
      //   this.cartService.removeVoucher();
      // }
    } else {
      this.removeItemFromCart(item);
    }
  }

  addAddress() {
    this.router.navigate(['/', 'delivery-address', 'add-delivery-address',
      { addressId: '', storeId: this.storeId, prevPage: 'cartpage' }]);
  }

  removeVoucher(voucherid) {
    this.voucher = {} as Voucher;
    this.cartService.removeVoucher();
  }

  changeAddress() {
    this.navCtrl.navigateForward(['/delivery-address', { storeId: this.storeId, prevPage: 'cartpage' }]);
  }

  calculateTotalAmount(cartList) {
    let amount = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < cartList.length; i++) {
      const productPrice: any = cartList[i].price;
      amount += (productPrice * cartList[i].quantity);
    }
    this.totalAmount = amount;
  }

  addItemsToCart(product, quantity = 1) {
    console.log(product);
    this.cartService.getAllCartItems().subscribe((data) => {
      const id = product.id;
      const list: Array<CartItem> = [];
      const parsedData = JSON.parse(data.value);
      console.log(parsedData);
      if (parsedData !== null) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < parsedData.length; i++) {
          if (parsedData[i].id === id) {
            parsedData[i].quantity += quantity;
            product.quantity += 1;
            this.cartService.setCartObject(parsedData);
            this.cartService.getAllCartItems().subscribe((data1) => {
              console.log(JSON.parse(data1.value));
              // this.cartList = JSON.parse(data1.value);
              this.calculateTotalAmount(JSON.parse(data1.value));
            });
          }
        }
      }
    });
  }

  applyVoucher() {
    if (this.currentuser) {
      if (this.storeClosingStatus === 1) {
        this.presentToast('Store is currently closed. Please apply coupon when store will open');
      } else {
        this.modalCtrl.create({ component: OfferListComponent, componentProps: { storeId: this.storeId, prevPage: 'cartpage' } })
          .then((modalEl) => {
            modalEl.present();
            return modalEl.onDidDismiss();
          }).then((resultData: any) => {
            if (resultData.role === 'voucherapplied') {
              this.voucher = resultData.data.voucherDetail;
              console.log(this.voucher);
            }
          });
      }
    } else {
      this.presentToast('You need to login in order to apply coupon code');
    }
  }

  getTotal(): number {
    // this.cartService.getAllCartItems().subscribe((data) => {
    //   let amount = 0;
    //   const parsedData = JSON.parse(data.value);
    //   // tslint:disable-next-line:prefer-for-of
    //   for (let i = 0; i < parsedData.length; i++) {
    //     const productPrice: any = parsedData[i].price;
    //     amount += (productPrice * parsedData[i].quantity);
    //   }
    //   this.totalAmount = amount;
    // });
    // this.totalAmount = this.cartService.getGrandTotal();
    return this.totalAmount;
  }

  getPayableAmount() {
    return this.totalAmount - this.getVoucherAmount();
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
    this.navCtrl.navigateForward(['/auth/login', { storeId: this.storeId }]);
  }

  quantityPlus(item) {
    if (item.quantity >= 10) {
      this.alertCtrl
        .create({
          header: 'Cart',
          message: 'You can\'t add more quantity of this product',
          buttons: ['Okay']
        })
        .then(alertEl => alertEl.present());
    } else {
      this.addItemsToCart(item, 1);
    }
  }

  removeItemFromCart(item) {
    this.alertCtrl
      .create({
        header: 'Remove Item ?',
        message: 'Are you sure you want to remove item from the cart.',
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
              this.removeItemById(item.id);
              // this.cartService.getAllCartItems().subscribe((data) => {
              //   this.cartList = JSON.parse(data.value);
              //   if ((this.cartList.length < 1) || (this.getTotal() < this.voucher.voucher_cart_amount)) {
              //     this.voucher = {} as Voucher;
              //     this.cartService.removeVoucher();
              //   } else if ((this.getTotal() < this.voucher.voucher_cart_amount)) {
              //     this.voucher = {} as Voucher;
              //     this.cartService.removeVoucher();
              //   }
              // });
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  removeItemById(id) {
    this.cartService.getAllCartItems().subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].id === id) {
          if (parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          } else {
            parsedData[i].quantity -= 1;
          }
          break;
        }
      }
      this.cartService.sendMessage(parsedData);
      this.cartService.setCartObject(parsedData);
      this.cartService.getAllCartItems().subscribe((data1) => {
        this.cartList = JSON.parse(data1.value);
        this.calculateTotalAmount(JSON.parse(data1.value));
        if ((this.cartList.length < 1) || (this.getTotal() < this.voucher.voucher_cart_amount)) {
          this.voucher = {} as Voucher;
          this.cartService.removeVoucher();
        } else if ((this.getTotal() < this.voucher.voucher_cart_amount)) {
          this.voucher = {} as Voucher;
          this.cartService.removeVoucher();
        }
      });
    });

  }

  addDeliveryOptions() {
    this.storeService.storeClosingStatus(this.storeId).subscribe((optiondata: any) => {
      console.log(optiondata);
      console.log(this.categoryId);
      if (optiondata.status === 200) {
        if (+optiondata.storeInfo[0].closed === 1) {
          this.alertCtrl
            .create({
              header: 'Store Information',
              message: 'Store is closed. Please try from another store',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    if (+this.categoryId === 0) {
                      this.navCtrl.navigateRoot(['/home/tabs/categories']);
                    } else {
                      this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
                    }
                    // this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
                  }
                }
              ]
            })
            .then(alertEl => alertEl.present());
        } else {
          if (this.auth.isauthenticated == null || this.auth.isauthenticated === false) {
            this.auth.redirectUrl = 'cartpage';
            this.router.navigate(['/', 'auth', 'login']);
          } else {
            this.router.navigate(['/', 'delivery-address', 'delivery-options', { storeId: this.storeId, categoryId: this.categoryId }]);
          }
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'middle' });
    toast.present();
  }

}
