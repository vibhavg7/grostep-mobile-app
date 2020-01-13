import { Component, OnInit } from '@angular/core';
import { CartService, CartItem, Voucher } from '../../cart/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StoreService } from '../../store/store.service';
import { AlertController } from '@ionic/angular';
import { OrderService } from '../../order/order.service';
import { DeliveryAddressService } from '../../delivery-address/delivery-address.service';

@Component({
  selector: 'app-payment-options',
  templateUrl: './payment-options.page.html',
  styleUrls: ['./payment-options.page.scss'],
})
export class PaymentOptionsPage implements OnInit {

  delivernow: boolean;
  addressinfo: any;
  voucher: Voucher;
  showDeliveryAddress: boolean;
  selectedeliverydate: any;
  selectedeliverytime: any;
  showVoucher = false;
  showPaymentDetails: boolean;
  showDetails: any;
  cartList: CartItem[];
  checkedIdx = 0;
  private CUSTOMER_ID = 'customerid';
  options = [
    'Cash On Delivery',
    'Card On Delivery',
    'Paytm on Delivery',
    'Sodexo',
    'Online Payment'
    // 'PayuMoney Wallet',confirmOrder
    // 'Pay with Paytm Wallet',
    // 'Credit/ Debit Card',
    // 'Net Banking',
    // 'PayZapp',
    // 'Pay using MobiKwiK Wallet'
  ];
  couponCode: any;
  constructor(
    private cartService: CartService,
    private deliveryService: DeliveryAddressService,
    private alertCtrl: AlertController,
    private orderService: OrderService,
    private storeService: StoreService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.showPaymentDetails = true;
  }

  ionViewWillEnter() {
    this.cartList = this.cartService.getAllCartItems();
    console.log(this.cartList);
    this.voucher = this.cartService.getAppliedVoucher();
    this.auth.getUserProfile().subscribe((data: any) => {
      this.addressinfo = data.customer_delivery_addresses.filter((address: any) => {
        return address.status === 1;
      })[0];
      console.log(this.addressinfo);
    });
    if (this.storeService.delivernow) {
      this.delivernow = true;
      this.selectedeliverydate = new Date();
      this.selectedeliverytime = '45 - 60 mins';
    } else {
      this.delivernow = false;
      const slotInfo = this.storeService.storeDeliveryslots
                                  .filter(slot => slot.slot_id === +this.storeService.selectedDeliverySlotId)[0];
      this.selectedeliverydate = slotInfo.delivery_date;
      this.selectedeliverytime = slotInfo.start_time % 12 + '' +
                            slotInfo.openingTimeClock + ' - ' + slotInfo.end_time % 12 + '' + slotInfo.closingTimeClock;
    }
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
    if (e) {
      this.checkedIdx = index;
      if (this.checkedIdx === 4) {
        this.presentOnlinePaymentAlert();
      }
    } else {
      this.checkedIdx = -1;
    }
  }

  confirmOrder() {
    const obj: any = {};
    obj.customerid = +localStorage.getItem(this.CUSTOMER_ID);
    obj.storeid = this.cartList[0].store_id;
    obj.deliverypersonid = '';
    obj.voucherid = this.voucher.voucher_id ? this.voucher.voucher_id : 0;
    obj.totalamount = this.cartService.getGrandTotal();
    obj.discountamount = this.cartService.getvoucherAmount();
    obj.deliveryfee = this.cartService.getDeliveryCharge();
    obj.payableamount = this.cartService.getGrandTotal() + this.getDeliveryCharge() - this.getVoucherAmount();
    obj.paymentmode = this.checkedIdx + 1;
    obj.delivernow = this.storeService.delivernow;
    obj.deliverydate = this.selectedeliverydate;
    obj.deliveryslot = this.selectedeliverytime;
    obj.deliveryaddressid = this.addressinfo.delivery_address_id;
    obj.totalitemcount = this.cartList.length;
    obj.instructions = this.deliveryService.getDeliveryInstructions();
    obj.products = this.cartList;
    this.orderService.placeOrder(obj).subscribe((data: any) => {
      if (data.status === 200) {
        this.cartService.removeAllCartItems();
        this.cartService.removeVoucher();
        this.router.navigate(['/payment/payment-status',
          { order_id: data.order_id, status: data.status }]);
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
    return this.cartService.getGrandTotal();
  }

  getDeliveryCharge(): number {
    return this.cartService.getDeliveryCharge();
  }

  getPayableAmount() {
    return this.cartService.getGrandTotal() + this.getDeliveryCharge() - this.getVoucherAmount();
  }

  getVoucherAmount() {
    return this.cartService.getvoucherAmount();
  }

  availableCouponCode() {
    this.router.navigate(['/offer', { prevPage: 'paymentoptionspage' }]);
  }

  applyCouponCode() {
  }

  removeVoucher(voucherid) {
    this.voucher = {} as Voucher;
    this.cartService.removeVoucher();
  }

}
