import { Component, OnInit, ApplicationRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { StoreService } from '../store.service';
import { CategoriesService } from '../../home/categories/categories.service';
import { AuthService } from '../../auth/auth.service';
import { Plugins } from '@capacitor/core';
import { CartItem, CartService } from '../../cart/cart.service';
import { forkJoin } from 'rxjs';
const { Storage } = Plugins;
@Component({
  selector: 'app-store-categories',
  templateUrl: './store-categories.page.html',
  styleUrls: ['./store-categories.page.scss'],
})
export class StoreCategoriesPage implements OnInit {

  timeFromCustomer: any;
  distanceFromCustomer: any;
  timeFromCustomerValue: any;
  distanceFromCustomerValue: any;
  errorMessage: any;
  storeId: number;
  categoryId: number;
  isLoading = false;
  loadedStore: any;
  storeCategories: any = [];
  cartList: Array<CartItem>;
  constructor(private activatedRoute: ActivatedRoute,
    private categoryService: CategoriesService,
    private cartService: CartService,
    private router: Router,
    private ref: ApplicationRef,
    private zone: NgZone,
    private platform: Platform,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private storeService: StoreService) { }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('categoryId') || !data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storeId = +data.get('storeId');
      this.categoryId = +data.get('categoryId');
    });
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.isLoading = true;
    this.loadedStore = this.storeService.StoreInfo;

    this.distanceFromCustomer = (this.loadedStore && this.loadedStore.distanceFromCustomer
      ? this.loadedStore.distanceFromCustomer : '');
    this.timeFromCustomer = (this.loadedStore && this.loadedStore.timeFromCustomer ? this.loadedStore.timeFromCustomer : '');


    this.distanceFromCustomerValue = (this.loadedStore && this.loadedStore.distanceFromCustomerValue
      ? this.loadedStore.distanceFromCustomerValue : '');
    this.timeFromCustomerValue = (this.loadedStore && this.loadedStore.timeFromCustomerValue ? this.loadedStore.timeFromCustomerValue : '');

    // if (this.loadedStore && Object.keys(this.loadedStore).length === 0 && this.loadedStore.constructor === Object) {
    forkJoin(this.storeService.fetchStoreInfoById(this.storeId), this.cartService.getAllCartItems()).subscribe((data) => {
      this.cartList = JSON.parse(data[1].value);
      this.storeService.StoreInfo = data[0].store[0];
      this.loadedStore = this.storeService.StoreInfo;
      this.storeCategories = data[0].store_categories;
      if (!this.distanceFromCustomerValue) {
        this.getStoreDistanceAndTime(this.loadedStore);
      } else {
        this.loadedStore.distanceFromCustomer = this.distanceFromCustomer;
        this.loadedStore.timeFromCustomer = this.timeFromCustomer;
        this.loadedStore.distanceFromCustomerValue = this.distanceFromCustomerValue;
        this.loadedStore.timeFromCustomerValue = this.timeFromCustomerValue;
        this.isLoading = false;
      }
    }, (error) => {
      this.errorMessage = error;
    });
    // } else {
    //   this.isLoading = false;
    // }
  }

  async getStoreDistanceAndTime(storeInfo) {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    const lat = JSON.parse(ret.value).lat;
    const long = JSON.parse(ret.value).long;
    this.authService.Lat = lat;
    this.authService.Long = long;
    const customerLatLong = [];
    const storeLatLong = [];
    customerLatLong.push(new google.maps.LatLng(this.authService.Lat, this.authService.Long));
    storeLatLong.push(new google.maps.LatLng(storeInfo.latitude, storeInfo.longitude));
    new google.maps.DistanceMatrixService().getDistanceMatrix({
      origins: storeLatLong, destinations: customerLatLong,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    }, (results: any) => {
      this.zone.run(() => {
        const distanceData = results.rows;
        this.loadedStore.distanceFromCustomer = distanceData[0].elements[0].distance.text;
        this.loadedStore.distanceFromCustomerValue = distanceData[0].elements[0].distance.value;
        this.loadedStore.timeFromCustomer = distanceData[0].elements[0].duration.text;
        this.loadedStore.timeFromCustomerValue = distanceData[0].elements[0].duration.value;
        this.isLoading = false;
        this.ref.tick();
      });
    });
  }

  clickStoreCategory(storeCategoryMappingId: number) {
    const loadedStoreCategory = this.storeCategories.filter(data => data.store_category_mapping_id === +storeCategoryMappingId);
    this.storeService.StoreCategory = loadedStoreCategory[0];
    this.router.navigate(['/', 'categories', this.categoryId,
      'stores', this.storeId, 'storecategories', storeCategoryMappingId, 'storeproducts']);
  }

  // viewCart() {
  //   this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
  //     if (data1.storeInfo[0].closed === 1) {
  //       this.alertCtrl
  //         .create({
  //           header: 'Store Information',
  //           message: 'Store is closed. Please try from another store',
  //           buttons: [
  //             {
  //               text: 'Okay',
  //               handler: () => {
  //                 this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
  //                 // this.router.navigate(['']);
  //               }
  //             }
  //           ]
  //         })
  //         .then(alertEl => alertEl.present());
  //     } else {
  //       this.router.navigate(['/cart', { storeId: this.storeId, categoryId: this.categoryId, storecategoryId: 0 }]);
  //     }
  //   });
  // }

  onSearch() {
    this.navCtrl.navigateForward([`/stores/storesearch/${this.categoryId}`,
    { searchName: this.loadedStore.store_name, storeId: this.storeId }]);
  }
}
