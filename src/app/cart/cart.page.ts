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
  chargeableDeliveryCost: any = 0;
  deliveryInstructions: any;
  slot: any;
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
  outOfStockProductExist = false;
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
    this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/home/tabs/cart') {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
  }

  async getObject() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url.split(';')[0] === '/home/tabs/cart') {
        this.navCtrl.navigateRoot(['/home/tabs/categories']);
      } else {
        this.navCtrl.pop();
      }
    });
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.currentuser = this.auth.isauthenticated;
    this.isLoading = true;
    this.cartService.getAllCartItems().subscribe((cartdata) => {
      const parsedCartData = JSON.parse(cartdata.value);
      if (parsedCartData && Object.keys(parsedCartData).length > 0 && parsedCartData.constructor === Object) {
        this.cartList = parsedCartData.items;
        this.deliveryInstructions = parsedCartData.deliveryInstructions;
        this.slot = parsedCartData.slot;
        this.chargeableDeliveryCost = parsedCartData.chargeableDeliveryCost;
        if (this.cartList !== null && this.cartList.length > 0) {
          const result = this.cartList.map(a => a.store_product_mapping_id);
          this.storeId = this.cartList[0].store_id;
          const cartId = JSON.parse(cartdata.value).cart_id;
          this.cartStoreName = this.cartList[0].store_name.trim();
          this.city = this.cartList[0].store_city.trim();
          this.cartService.validateStoreCartProducts(result, this.storeId).subscribe(async (data: any) => {
            if (+data.status === 200) {
              this.cartList.map((data1: any) => {
                const result1 = data.cartData.filter(a1 => a1.store_product_mapping_id === data1.store_product_mapping_id);
                if (result1.length > 0) {
                  data1.stock = result1[0].stock;
                  data1.store_selling_price = result1[0].store_selling_price;
                  data1.product_marked_price = result1[0].product_marked_price;
                  data1.store_product_caping = result1[0].store_product_caping;
                  data1.store_discount = result1[0].store_discount;
                  data1.store_product_status = result1[0].store_product_status;
                  data1.image_url = result1[0].image_url;
                }
              });
              const cartObj: any = {};
              cartObj.chargeableDeliveryCost = this.chargeableDeliveryCost;
              cartObj.count = this.cartList.length;
              cartObj.items = this.cartList;
              cartObj.paymentMode = null;
              if (cartId) {
                cartObj.cart_id = cartId;
              }
              if (this.deliveryInstructions) {
                cartObj.deliveryInstructions = this.deliveryInstructions;
              } else {
                cartObj.deliveryInstructions = '';
              }
              if (this.slot && Object.keys(this.slot).length > 0 && this.slot.constructor === Object) {
                cartObj.slot = this.slot;
              } else {
                cartObj.slot = {};
              }
              cartObj.total = this.cartList.reduce((sum, current) => {
                return sum + (current.store_selling_price * current.quantity);
              }, 0);
              this.cartService.setCartObject(cartObj);
              this.outOfStockProductExist = this.cartList.some((data12: any) => +data12.stock === 0);
              this.calculateTotalAmount(this.cartList);
              this.storeClosingStatus = +data.storeData[0].closed;
              if (this.currentuser) {
                this.auth.getSelectedCustomerAddressCityWiseAndVoucher(this.city).subscribe((data12: any) => {
                  this.selectedAddress = data12[0].addressInfo[0];
                  this.addressCount = data12[0].customer_address_count[0].customer_address_count;
                  const voucher = JSON.parse(data12[1].value);
                  if (voucher != null) {
                    this.voucher = voucher;
                  } else {
                    this.voucher = {};
                  }
                });
              }
            }
          });
        }
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }

  ionViewWillEnter() {
    this.subscription = this.auth.getToken().subscribe((message: any) => {
      // console.log(message);
      if (message.text !== '') {
        // console.log('inside' + message.text);
        this.currentuser = true;
        this.getObject();
      }
    });
    // console.log('outside');
    this.getObject();
  }

  backToHome() {
    if (this.router.url.split(';')[0] === '/home/tabs/cart') {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    } else {
      this.navCtrl.pop();
    }
  }

  quantityMinus(item) {
    // console.log(item);
    this.removeItemById(item.store_product_mapping_id);
    // if (item.quantity > 1) {
    //   this.removeItemById(item.store_product_mapping_id);
    // //   // if ((this.cartService.getGrandTotal() < this.voucher.voucher_cart_amount)) {
    // //   //   this.voucher = {} as Voucher;
    // //   //   this.cartService.removeVoucher();
    // //   // }
    // } else {
    // //   this.removeItemFromCart(item);
    // }
  }

  addAddress() {
    this.router.navigate(['/', 'delivery-address', 'add-delivery-address',
      { addressId: '', storeId: this.storeId, prevPage: 'cartpage' }]);
  }

  removeOutOfStockProduct() {
    // console.log('removeOutOfStockProduct');
    console.log(this.storeId);
    this.storeService.storeClosingStatus(this.storeId).subscribe(async (optiondata: any) => {
      // console.log(optiondata);
      if (+optiondata.status === 200) {
        if (+optiondata.storeInfo[0].closed === 1) {
          this.isLoading = false;
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
            this.isLoading = false;
            this.auth.redirectUrl = 'cartpage';
            this.router.navigate(['/', 'auth', 'login']);
          } else {
            const customerId = localStorage.getItem('customerid');
            const cartData = await Storage.get({ key: 'cartList' });
            const cart_id = JSON.parse(cartData.value).cart_id;
            const deliveryInstructions = JSON.parse(cartData.value).deliveryInstructions;
            const parsedcartData = JSON.parse(cartData.value);
            const cartArray = [];
            if (parsedcartData != null) {
              const parsedcartDataItems = parsedcartData.items;
              const selectedAddress = this.selectedAddress;
              if (parsedcartDataItems != null && Array.isArray(parsedcartDataItems)
                && parsedcartDataItems && parsedcartDataItems.length > 0) {
                const stockparsedcartDataItems = parsedcartDataItems.filter((e) => {
                  return e.stock > 0;
                });
                stockparsedcartDataItems.forEach(data => {
                  const obj: any = {};
                  obj.store_id = data.store_id;
                  obj.quantity = data.quantity;
                  obj.store_product_mapping_id = data.store_product_mapping_id;
                  obj.store_selling_price = data.store_selling_price;
                  cartArray.push(obj);
                });
                // console.log(cartArray);
                this.cartService.syncCartProducts(cartArray, cart_id, deliveryInstructions, selectedAddress.delivery_address_id)
                .subscribe((data: any) => {
                  if (data.status === 200) {
                    // console.log(data);
                    const cartObj: any = {};
                    const newcartProductData = data.customerCart;
                    const newcartInfo = data.cartInfo;
                    cartObj.chargeableDeliveryCost = newcartInfo.delivery_cost === null ? 0 : newcartInfo.delivery_cost;
                    cartObj.count = newcartProductData.length;
                    cartObj.items = newcartProductData;
                    cartObj.paymentMode = null;
                    cartObj.cart_id = data.cart_id;
                    cartObj.deliveryInstructions = newcartInfo.instructions;
                    cartObj.slot = newcartInfo.slot;
                    cartObj.total = newcartProductData.reduce((sum, current) => {
                      return sum + (current.store_selling_price * current.quantity);
                    }, 0);
                    this.cartService.setCartObject(cartObj);
                    this.cartService.getAllCartItems().subscribe((data1) => {
                      this.cartList = JSON.parse(data1.value).items;
                      this.outOfStockProductExist = this.cartList.some((data12: any) => +data12.stock === 0);
                      // console.log(this.outOfStockProductExist);
                      if (!this.outOfStockProductExist) {
                        this.router.navigate(['/', 'delivery-address', 'delivery-options', {
                          storeId: this.storeId,
                          categoryId: this.categoryId
                        }]);
                      }
                    });
                  }
                  this.isLoading = false;
                });
              }
            } else {

            }
          }
        }
      }
    });
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
      const productPrice: any = cartList[i].store_selling_price;
      amount += (productPrice * cartList[i].quantity);
    }
    this.totalAmount = amount;
  }

  deleteCart() {
    this.alertCtrl
      .create({
        header: 'Confirm Delete',
        message: 'Are you sure you want to remove the cart',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'cancelcss',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'YES',
            cssClass: 'removecss',
            handler: () => {
              console.log('delete cart');
              this.cartList = this.cartService.removeAllCartItems();
            }
          }]
      })
      .then(alertEl => alertEl.present());
  }

  async setAndGetCart(parsedData) {
    let ret1 = await Storage.get({ key: 'cartList' });
    let parsedCartData = JSON.parse(ret1.value);

    if (parsedData === null) {
      const cartList: any = {};
      cartList.count = 0;
      cartList.total = 0;
      cartList.chargeableDeliveryCost = 0;
      cartList.items = [];
      cartList.deliveryInstructions = '';
      cartList.paymentMode = 0;
      cartList.uniqueSkuInCart = 0;
      cartList.slot = {};
      this.cartService.setCartObject(cartList);
      ret1 = await Storage.get({ key: 'cartList' });
      parsedCartData = JSON.parse(ret1.value);
    }

    const cartId = JSON.parse(ret1.value).cart_id;
    this.deliveryInstructions = JSON.parse(ret1.value).deliveryInstructions;
    const cartObj: any = {};
    cartObj.chargeableDeliveryCost = this.chargeableDeliveryCost;
    cartObj.deliveryInstructions = this.deliveryInstructions;
    cartObj.count = parsedData.length;
    cartObj.items = parsedData;
    if (cartId) {
      cartObj.cart_id = cartId;
    }
    if (this.deliveryInstructions) {
      cartObj.deliveryInstructions = this.deliveryInstructions;
    } else {
      cartObj.deliveryInstructions = '';
    }
    if (this.slot && Object.keys(this.slot).length > 0 && this.slot.constructor === Object) {
      cartObj.slot = this.slot;
    } else {
      cartObj.slot = {};
    }
    cartObj.paymentMode = null;
    cartObj.total = parsedData.reduce((sum, current) => {
      return sum + (current.store_selling_price * current.quantity);
    }, 0);
    this.cartService.setCartObject(cartObj);
    this.cartService.getAllCartItems().subscribe((data1) => {
      this.cartList = JSON.parse(data1.value).items;
      this.calculateTotalAmount(this.cartList);
      if ((this.cartList.length < 1) || (this.getTotal() < this.voucher.voucher_cart_amount)) {
        this.voucher = {} as Voucher;
        this.cartService.removeVoucher();
      }
    });
  }

  addItemsToCart(product, quantity = 1) {
    this.cartService.getAllCartItems().subscribe((data) => {
      const id = product.store_product_mapping_id;
      const list: Array<CartItem> = [];
      const parsedData = JSON.parse(data.value);
      // console.log(parsedData);
      if (parsedData !== null) {
        const cartData = JSON.parse(data.value).items;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < cartData.length; i++) {
          if (cartData[i].store_product_mapping_id === id) {
            cartData[i].quantity += quantity;
            product.quantity += 1;
            this.setAndGetCart(cartData);
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
    // console.log(this.totalAmount);
    return this.totalAmount;
  }

  getPayableAmount() {
    return this.totalAmount - this.getVoucherAmount();
  }

  getVoucherAmount() {
    // console.log(this.voucher);
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
    // console.log(item);
    if (item.quantity >= 5) {
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
              this.removeItemById(item.store_product_mapping_id);
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
      const parsedData = JSON.parse(data.value).items;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].store_product_mapping_id === id) {
          if (parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          } else {
            parsedData[i].quantity -= 1;
          }
          break;
        }
      }
      this.cartService.sendMessage(parsedData);
      this.setAndGetCart(parsedData);
      // const cartObj: any = {};
      // cartObj.chargeableDeliveryCost = 0;
      // cartObj.count = parsedData.length;
      // cartObj.items = parsedData;
      // cartObj.paymentMode = null;
      // cartObj.total = parsedData.reduce((sum, current) => {
      //   return sum + current.store_selling_price;
      // }, 0);
      // this.cartService.setCartObject(cartObj);
      // this.cartService.getAllCartItems().subscribe((data1) => {
      //   this.cartList = JSON.parse(data1.value).items;
      //   this.calculateTotalAmount(this.cartList);
      // });
    });

  }

  checkout() {
    this.isLoading = true;
    this.storeService.storeClosingStatus(this.storeId).subscribe(async (optiondata: any) => {
      if (+optiondata.status === 200) {
        if (+optiondata.storeInfo[0].closed === 1) {
          console.log('inside');
          this.isLoading = false;
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
            this.isLoading = false;
            this.auth.redirectUrl = 'cartpage';
            this.router.navigate(['/', 'auth', 'login']);
          } else {
            const customerId = localStorage.getItem('customerid');
            const cartData = await Storage.get({ key: 'cartList' });
            const parsedCartData =  JSON.parse(cartData.value);
            if (parsedCartData && Object.keys(parsedCartData).length > 0 && parsedCartData.constructor === Object) {
              console.log('inside1');
              const parsedData = JSON.parse(cartData.value).items;
              const cart_id = JSON.parse(cartData.value).cart_id;
              const deliveryInstructions = JSON.parse(cartData.value).deliveryInstructions;
              const cartArray = [];
              const selectedAddress = this.selectedAddress;
              if (parsedData != null && Array.isArray(parsedData) && parsedData && parsedData.length > 0) {
                parsedData.forEach(data => {
                  const obj: any = {};
                  obj.store_id = data.store_id;
                  obj.quantity = data.quantity;
                  obj.store_product_mapping_id = data.store_product_mapping_id;
                  obj.store_selling_price = data.store_selling_price;
                  cartArray.push(obj);
                });
                this.cartService.syncCartProducts(cartArray, cart_id, deliveryInstructions, selectedAddress.delivery_address_id)
                .subscribe((data: any) => {
                  if (data.status === 200) {
                    console.log(data);
                    const newcartProductData = data.customerCart;
                    const newcartInfo = data.cartInfo;
                    const cartObj: any = {};
                    // cartObj.chargeableDeliveryCost = newcartInfo.delivery_cost;
                    cartObj.chargeableDeliveryCost = newcartInfo.delivery_cost === null ? 0 : newcartInfo.delivery_cost;
                    cartObj.count = newcartProductData.length;
                    cartObj.items = newcartProductData;
                    cartObj.paymentMode = null;
                    cartObj.cart_id = data.cart_id;
                    cartObj.deliveryInstructions = newcartInfo.instructions;
                    cartObj.slot = newcartInfo.slot === null ? {} : newcartInfo.slot;
                    cartObj.total = newcartProductData.reduce((sum, current) => {
                      return sum + (current.store_selling_price * current.quantity);
                    }, 0);
                    this.cartService.setCartObject(cartObj);
                    this.cartService.getAllCartItems().subscribe((data1) => {
                      this.cartList = JSON.parse(data1.value).items;
                      this.outOfStockProductExist = this.cartList.some((data12: any) => +data12.stock === 0);
                      this.isLoading = false;
                      if (!this.outOfStockProductExist) {
                        this.router.navigate(['/', 'delivery-address', 'delivery-options', {
                          storeId: this.storeId,
                          categoryId: this.categoryId
                        }]);
                      }
                    });
                  }
                });
              }
            } else  {
              this.navCtrl.navigateRoot(['/home/tabs/categories']);
            }
          }
        }
      }
    });

  }

  ngOnDestroy() {
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
