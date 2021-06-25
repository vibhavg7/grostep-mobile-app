import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { CategoriesService } from './categories.service';
import { OnEnter } from '../on-enter';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { CartService } from '../../cart/cart.service';

const { Storage } = Plugins;
@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnEnter, OnDestroy {

  cityWisebannerImages: any;
  skeletonStoreCount;
  noContactbannerImages: any;
  usertempaddress: any;
  customerliveorderscount = 0;
  errorMessage: any = '';
  bannerImages: any = [];
  categoryImages: any = [];
  sliderOptions = {
    zoom: false,
    slidesPerView: 1.4,
    // slidesPerColumn: 1.5,
    // slidesPerGroup: 1.5,
    centeredSlides: false,
    spaceBetween: 10,
    watchSlidesProgress: false,
    // resistanceRatio: 0,
    // virtualTranslate: true,
  };

  sliderOptions1 = {
    zoom: false,
    slidesPerView: 1.4,
    // slidesPerColumn: 1.5,
    // slidesPerGroup: 1.5,
    centeredSlides: false,
    spaceBetween: 0,
    watchSlidesProgress: true,
    // resistanceRatio: 0,
    // virtualTranslate: true,
  };

  isLoading = false;
  customerInfo: any;
  private subscription: Subscription;
  constructor(
    private router: Router,
    private platform: Platform,
    private navCtrl: NavController,
    private ref: ApplicationRef,
    private cartService: CartService,
    private categoryService: CategoriesService) { }

  public ngOnInit() {
    this.isLoading = true;
    this.skeletonStoreCount = new Array(1);
  }

  async getObject() {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    this.usertempaddress = JSON.parse(ret.value).locationaddress !== undefined ?
      JSON.parse(ret.value).locationaddress : JSON.parse(ret.value).locality;
  }

  public async onEnter(): Promise<void> {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    const parsedData = JSON.parse(ret.value);

    if (parsedData && Object.keys(parsedData).length > 0 && parsedData.constructor === Object) {
      if (parsedData.locationaddress) {
        this.usertempaddress = parsedData.locationaddress;
        setTimeout(() => {
          this.categoryService.storeDataCatData(JSON.parse(ret.value).serviceableAreaId)
            .subscribe((data: any) => {
              this.isLoading = false;
              console.log(data);
              this.categoryImages = data[0].store_categories;
              this.bannerImages = data[0].banners.filter(b => {
                return b.banner_type === 1;
              });
              this.noContactbannerImages = data[0].banners.filter(b => {
                return b.banner_type === 2;
              });
              this.cityWisebannerImages = data[0].banners.filter(b => {
                return b.banner_type === 3;
              });
              this.customerliveorderscount = (data[1].length > 0) ? data[1].customer_liveorders_count.customer_liveorders_count : 0;
              // this.customerInfo = data[3].customer_info[0];
              this.checkandCreateCart();
              // if (this.customerInfo !== undefined && this.customerInfo.customer_name !== undefined
              //   && this.customerInfo.customer_name != null) {
              //   this.customerInfo.customer_name = this.titleCase(this.customerInfo.customer_name);
              // } else {
              // }
              this.ref.tick();
            }, (error) => {
              this.errorMessage = error;
            });
        }, 500);
      } else {
        this.usertempaddress = parsedData.locality;
      }
    } else {
      this.navCtrl.navigateRoot(['/home/tabs/categories']);
    }

    this.ref.tick();
  }

  async checkandCreateCart() {
    // console.log('hey');
    const ret = await Storage.get({ key: 'cartList' });
    const parsedCartData = JSON.parse(ret.value);
    console.log(parsedCartData);
    // const cart = JSON.parse(ret.value);
    if (parsedCartData === null) {
      const cartList: any = {};
      cartList.count = 0;
      cartList.total = 0;
      cartList.chargeableDeliveryCost = 0;
      cartList.slot = {};
      cartList.pricingDetails = {};
      cartList.items = [];
      cartList.paymentMode = 0;
      cartList.uniqueSkuInCart = 0;
      cartList.deliveryInstructions = '';
      this.cartService.setCartObject(cartList);
    }
  }

  selectItem(item) {
  }

  titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  }

  changedeliverylocation() {
    this.navCtrl.navigateForward(['/changedeliverylocation']);
  }

  grostepStores() {
    this.navCtrl.navigateForward(['/stores/grostepstore']);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  slidesDidLoad(slides) {
    slides.startAutoplay();
  }

  async ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      // tslint:disable-next-line:no-string-literal
      navigator['app'].exitApp();
    });
    console.log('hello');
    await this.onEnter();
    this.subscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && event.url === '/home/tabs/categories') {
        console.log('Hey');
        this.onEnter();
      }
    });

  }

}
