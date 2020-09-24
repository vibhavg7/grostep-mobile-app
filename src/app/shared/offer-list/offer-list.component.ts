import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { OfferService } from '../../offer/offer.service';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss'],
})
export class OfferListComponent implements OnInit, AfterViewInit {
  @Input() storeId: any;
  @Input() prevPage: any;
  cartAmount: number;
  offers: any = [];
  totalAmount: number;
  isLoading = false;

  constructor(private modalCtrl: ModalController,
              private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private platform: Platform,
              private cartService: CartService,
              private toastCtrl: ToastController,
              private offerService: OfferService) { }

  ngOnInit() {
    this.isLoading = true;
    this.cartService.getAllCartItems().subscribe((data1) => {
      const parsedData = JSON.parse(data1.value);
      this.calculateTotalAmount(parsedData);
      this.offerService.fetchAllOffers().subscribe((data) => {
        if (data.status === 200) {
          this.offers = data.vouchers;
          this.isLoading = false;
          this.offers.forEach((offerData: any) => {
            if (this.totalAmount >= offerData.voucher_cart_amount &&
                (this.prevPage === 'cartpage' || this.prevPage === 'paymentoptionspage') ) {
              offerData.applyButton = true;
            } else {
              offerData.applyButton = false;
            }
          });
          console.log(this.offers);
        }
      });
    });
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

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.modalCtrl.dismiss(null, 'cancel');
    });
  }

  ionViewWillEnter() {
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  applyVoucher(offer) {
    console.log(offer);
    if (offer.applyButton) {
      this.cartService.setVoucher(offer);
      this.presentToast(`${offer.voucher_code} code applied sucessfully.`);
      this.modalCtrl.dismiss({message: 'Coupon code applied sucessfully', voucherDetail: offer}, 'voucherapplied');
    } else {
      this.presentToast(`This coupon code is not applicable for this order.`);
    }
    // if (this.prevPage === 'cartpage') {
    //   this.navCtrl.navigateBack(`/cart/${this.storeId}`);
    // } else if (this.prevPage === 'paymentoptionspage') {
    //   this.navCtrl.navigateBack(`/payment/payment-options`);
    // }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'middle' });

    toast.present();
  }

}
