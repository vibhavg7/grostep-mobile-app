import { Component, OnInit } from '@angular/core';
import { CartService, CartItem, Voucher } from '../../cart/cart.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store/store.service';
import { AlertController, ToastController, ModalController, NavController } from '@ionic/angular';
import { OrderService } from '../../order/order.service';
import { DeliveryAddressService } from '../../delivery-address/delivery-address.service';
import { OfferService } from '../../offer/offer.service';
import { OfferListComponent } from '../../shared/offer-list/offer-list.component';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-payment-options',
  templateUrl: './payment-options.page.html',
  styleUrls: ['./payment-options.page.scss'],
})
export class PaymentOptionsPage implements OnInit {

  deliveryCharge: number;
  storeClosingStatus: number;
  currentuser: boolean;
  totalAmount: number;
  utcselectedeliverydate: any;
  confirmedOrder = false;
  isLoading = false;
  storeId: number;
  categoryId: number;
  deliveryInstructions: string;
  delivernow: boolean;
  addressinfo: any;
  voucher: any;
  showDeliveryAddress: boolean;
  selectedeliverydate: any;
  selectedeliverytime: any;
  showVoucher = false;
  showPaymentDetails: boolean;
  showDetails: any;
  cartList: CartItem[];
  checkedIdx = 1;
  private CUSTOMER_ID = 'customerid';
  private CUSTOMER_PHONE = 'customerphone';
  options: any;
  // [
  //   'Cash On Delivery',
  //   'Card On Delivery',
  //   'Paytm on Delivery',
  //   'Sodexo',
  //   'Online Payment'
  //   // 'PayuMoney Wallet',confirmOrder
  //   // 'Pay with Paytm Wallet',
  //   // 'Credit/ Debit Card',
  //   // 'Net Banking',
  //   // 'PayZapp',
  //   // 'Pay using MobiKwiK Wallet'
  // ];
  couponCode: any;
  constructor(
    private cartService: CartService,
    public toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private deliveryService: DeliveryAddressService,
    private alertCtrl: AlertController,
    private orderService: OrderService,
    private offerService: OfferService,
    private storeService: StoreService,
    private auth: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.showPaymentDetails = true;
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storeId = +this.activatedRoute.snapshot.paramMap.get('storeId');
      this.categoryId = +this.activatedRoute.snapshot.paramMap.get('categoryId');
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.cartService.getAllCartItems().subscribe((data) => {
      const parsedCartData = JSON.parse(data.value);
      if (parsedCartData) {
        this.cartList = parsedCartData.items;
        console.log(this.cartList);
        if (this.cartList !== null && this.cartList.length > 0) {
          this.calculateTotalAmount(this.cartList);
          this.deliveryCharge = this.cartService.getDeliveryCharge();
          this.deliveryService.getDeliveryInstructions().subscribe((data1) => {
            this.deliveryInstructions = data1.value;
          });
          this.cartService.getAppliedVoucher().subscribe((voucherData) => {
            const voucher = JSON.parse(voucherData.value);
            console.log(voucher);
            if (voucher != null) {
              this.voucher = voucher;
            } else {
              this.voucher = {};
            }
          });
          this.getObject();
        }
      }
    });
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


  async getObject() {
    const localMoment = moment();
    const utcMoment = moment.utc();
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.currentuser = this.auth.isauthenticated;
    this.auth.getProfileAndPaymentMethodInfo(JSON.parse(ret.value).city).subscribe((data: any) => {
      this.addressinfo = data[0].customer_delivery_addresses.filter((address: any) => {
        return address.status === 1;
      })[0];
      this.options = data[1].paymentMethods;
      if (this.storeService.delivernow) {
        this.delivernow = true;
        this.selectedeliverydate = utcMoment.format('DD/MM/YYYY');
        this.utcselectedeliverydate = utcMoment.format();
        this.selectedeliverytime = '60 - 90 mins';
      } else {
        this.delivernow = false;
        const slotInfo = this.storeService.storeDeliveryslots
          .filter(slot => slot.slot_id === +this.storeService.selectedDeliverySlotId)[0];
        this.selectedeliverydate = slotInfo.delivery_date;
        this.utcselectedeliverydate = slotInfo.utc_delivery_date;
        this.selectedeliverytime = slotInfo.start_time % 12 + '' +
          slotInfo.openingTimeClock + ' - ' + slotInfo.end_time % 12 + '' + slotInfo.closingTimeClock;
      }
      this.storeService.storeClosingStatus(this.storeId).subscribe((data1: any) => {
        if (data1.status === 200) {
          this.isLoading = false;
          this.storeClosingStatus = +data1.storeInfo[0].closed;
        }
      });
    });
  }

  togglecartlist() {
    if (this.showDetails) {
      this.showDetails = false;
      this.showPaymentDetails = true;
    } else {
      this.showVoucher = false;
      this.showDeliveryAddress = false;
      this.showDetails = true;
      this.showPaymentDetails = false;
    }
  }

  togglepayment() {
    if (this.showPaymentDetails) {
      this.showPaymentDetails = false;
    } else {
      this.showVoucher = false;
      this.showDetails = false;
      this.showDeliveryAddress = false;
      this.showPaymentDetails = true;
    }
  }

  changePaymentOption(e, index) {
    // console.log(this.checkedIdx);
    // console.log(e);
    // console.log(index);
    if (e) {
      this.checkedIdx = index;
      if (this.checkedIdx === 5) {
        this.presentOnlinePaymentAlert();
      }
    } else {
      this.checkedIdx = -1;
    }
    // console.log(this.checkedIdx);
  }

  confirmOrder() {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
      this.confirmedOrder = true;
      if (data1.storeInfo[0].closed === 1) {
        this.alertCtrl
          .create({
            header: 'Store Information',
            message: 'Store is closed. Please try from another store',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.confirmedOrder = false;
                  this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
                  // this.router.navigate(['']);
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        // console.log(this.storeService.StoreInfo.token)
        this.confirmedOrder = true;
        this.isLoading = true;
        const obj: any = {};
        obj.customerid = +localStorage.getItem(this.CUSTOMER_ID);
        obj.storeid = this.cartList[0].store_id;
        obj.deliverypersonid = '';
        obj.voucherid = _.isEmpty(this.voucher) ? 0 : this.voucher.voucher_id;
        obj.totalamount = this.totalAmount;
        obj.discountamount = this.getVoucherAmount();
        obj.deliveryfee = this.cartService.getDeliveryCharge();
        obj.payableamount = this.totalAmount + this.getDeliveryCharge() - this.getVoucherAmount();
        obj.paymentmode = this.checkedIdx;
        obj.delivernow = this.storeService.delivernow;
        obj.storeToken = this.storeService.StoreInfo.token;
        obj.deliverydate = this.utcselectedeliverydate;
        obj.deliveryslot = this.selectedeliverytime;
        obj.phone = +localStorage.getItem(this.CUSTOMER_PHONE);
        obj.deliveryaddressid = this.addressinfo.delivery_address_id;
        obj.totalitemcount = this.cartList.length;
        obj.instructions = this.deliveryInstructions;
        obj.products = this.cartList;
        obj.payment_status = 1;
        console.log(obj);
        this.orderService.placeOrder(obj).subscribe((data: any) => {
          if (data.status === 200) {
            this.cartService.removeAllCartItems();
            this.cartService.removeVoucher();
            this.deliveryService.removeInstructions();
            this.router.navigate(['/payment/payment-status',
              { order_id: data.order_id, status: data.status }]);
            this.isLoading = false;
            this.confirmedOrder = false;
          }
        });
      }
    });
  }

  presentOnlinePaymentAlert() {
    this.alertCtrl
      .create({
        header: 'Payment',
        // tslint:disable-next-line:max-line-length
        message: 'Note : When you click on Place Order - Your order will be placed first and then you will be redirected to payment page.',
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

  togglevoucher() {
    if (this.showVoucher) {
      this.showVoucher = false;
      this.showPaymentDetails = true;
    } else {
      this.showVoucher = true;
      this.showDetails = false;
      this.showDeliveryAddress = false;
      this.showPaymentDetails = false;
    }
  }

  toggleDeliveryAddress() {
    if (this.showDeliveryAddress) {
      this.showDeliveryAddress = false;
      this.showPaymentDetails = true;
    } else {
      this.showVoucher = false;
      this.showDetails = false;
      this.showPaymentDetails = false;
      this.showDeliveryAddress = true;
    }
  }

  getTotal(): number {
    return this.totalAmount;
  }

  getDeliveryCharge(): number {
    return this.cartService.getDeliveryCharge();
  }

  getPayableAmount() {
    return this.totalAmount + this.getDeliveryCharge() - this.getVoucherAmount();
  }

  getVoucherAmount() {
    return _.isEmpty(this.voucher) ? 0 : this.voucher.voucher_amount;
  }

  // availableCouponCode() {
  //   this.modalCtrl.create({ component: OfferListComponent, componentProps: { storeId: this.storeId, prevPage: 'cartpage' } })
  //     .then((modalEl) => {
  //       modalEl.present();
  //       return modalEl.onDidDismiss();
  //     }).then((resultData: any) => {
  //       if (resultData.role === 'voucherapplied') {
  //         this.voucher = resultData.data.voucherDetail;
  //         console.log(this.voucher);
  //       }
  //     });
  //   // this.router.navigate(['/offer', { prevPage: 'paymentoptionspage' }]);
  // }


  applyVoucher() {
    if (this.currentuser) {
      if (this.storeClosingStatus === 1) {
        this.presentToast('Store is currently closed. Please apply coupon when store will open');
      } else {
        this.modalCtrl.create({ component: OfferListComponent, componentProps: { storeId: this.storeId, prevPage: 'paymentoptionspage' } })
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

  removeVoucher(voucherid) {
    this.voucher = {} as Voucher;
    this.cartService.removeVoucher();
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1000, position: 'bottom' });

    toast.present();
  }


}
