import { Component, OnInit } from '@angular/core';
import { OfferService } from './offer.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.page.html',
  styleUrls: ['./offer.page.scss'],
})
export class OfferPage implements OnInit {

  errorMessage: any;
  storeId: string;
  cartAmount: number;
  prevPage: string;
  offers: any = [];
  isLoading = false;
  skeletonStoreCount: any;
  constructor(
      private activatedRoute: ActivatedRoute,
      private navCtrl: NavController,
      private platform: Platform,
      private cartService: CartService,
      private offerService: OfferService) { }

  ngOnInit() {
    this.skeletonStoreCount = new Array(10);
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.prevPage = this.activatedRoute.snapshot.paramMap.get('prevPage');
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
    this.cartAmount = this.cartService.getGrandTotal();
    this.isLoading = true;
    setTimeout(() => {
      this.fetchAllOffers();
    }, 500);
  }

  fetchAllOffers() {
    this.offerService.fetchAllOffers().subscribe((data) => {
      console.log(data);
      if (data.status === 200) {
        this.offers = data.vouchers;
        this.isLoading = false;
        this.offers.forEach((offerData: any) => {
          if (this.cartAmount >= offerData.voucher_cart_amount
              && offerData.customer_daily_usage_count < offerData.voucher_max_usage_count
              && offerData.customer_used_count < offerData.voucher_max_limit_user
              (this.prevPage === 'cartpage' || this.prevPage === 'paymentoptionspage') ) {
            offerData.applyButton = true;
          } else {
            offerData.applyButton = false;
          }
        });
      }
    }, (error) => {
      this.errorMessage = error;
      this.isLoading = false;
    });
  }

  applyVoucher(offer) {
    if (+offer.calculation_type === 1) {
      const offerValue = this.cartAmount * (offer.voucher_value / 100);
      if (offerValue >= offer.voucher_max_value) {
        offer.voucher_amount = offer.voucher_max_value;
      } else  {
        offer.voucher_amount = Math.ceil(offerValue);
      }
    }
    if (+offer.calculation_type === 2) {
      if (offer.voucher_amount >= offer.voucher_max_value) {
        offer.voucher_amount = offer.voucher_max_value;
      } else  {
        offer.voucher_amount = offer.voucher_value;
      }
    }
    console.log(offer);
    this.cartService.setVoucher(offer);
    if (this.prevPage === 'cartpage') {
      this.navCtrl.navigateBack(`/cart/${this.storeId}`);
    } else if (this.prevPage === 'paymentoptionspage') {
      this.navCtrl.navigateBack(`/payment/payment-options`);
    }
  }
}
