import { Component, OnInit, ApplicationRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from './store.service';
import { NavController, AlertController, Platform, IonInfiniteScroll } from '@ionic/angular';
import { CategoriesService } from '../home/categories/categories.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { tap, distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { AuthService } from '../auth/auth.service';
import { CartService, CartItem } from '../cart/cart.service';
const { Storage } = Plugins;
@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit, OnDestroy {

  totalPages: number;
  distanceData: any = [];
  city: any;
  filterBy: any;
  currentPage = 1;
  pageSize = 10;
  skeletonStoreCount;
  storebackgroundcolor = ['#e9f5f8', '#e5fbe5', '#ffe7eb'];
  cartList: Array<CartItem>;
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
  constructor(private activatedRoute: ActivatedRoute,
              private categoryService: CategoriesService,
              private router: Router,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              private ref: ApplicationRef,
              private platform: Platform,
              private formBuilder: FormBuilder,
              private authService: AuthService,
              private cartService: CartService,
              private storeService: StoreService) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
  }
  loadedStores: any = [];
  categoryName: any;
  loadedStoresCount = 0;
  likedBy = false;
  errorMessage: any = '';
  categoryId: number;
  isLoading = false;
  searchCriteriaForm: FormGroup;
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('categoryId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.skeletonStoreCount = new Array(10);
      this.categoryId = +data.get('categoryId');
    });
    const storeCategories: any = this.categoryService.StoreCategories;
    // console.log(storeCategories);
    const d1: any = storeCategories.filter(d => d.store_category_id === this.categoryId);
    this.categoryName = d1[0].store_category_name;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


  ionViewWillEnter() {
    // console.log('ionViewWillEnter');
    this.platform.backButton.subscribeWithPriority(0, () => {
        this.navCtrl.pop();
    });
    this.loadedStoresCount = 0;
    this.currentPage = 1;
    this.loadedStores = [];
    this.getObject();
  }

  favouriteStore(storeid) {
    this.alertCtrl
      .create({
        header: 'Confirm',
        message: 'Are you sure you want to make as favourite store',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'cancelcss',
            handler: () => {
            }
          },
          {
            text: 'YES',
            cssClass: 'removecss',
            handler: () => {
              this.loadedStores.forEach(store => {
                if (store.store_id === storeid) {
                  store.likedBy = true;
                }
              });

            }
          }]
      })
      .then(alertEl => alertEl.present());
  }

  clickStore(storeId: number, closed: number) {
      const loadedStore = this.loadedStores.filter(data => data.store_id === +storeId);
      // console.log(loadedStore);
      this.storeService.StoreInfo = loadedStore[0];
      this.router.navigate(['/', 'categories', this.categoryId, 'stores', storeId, 'storecategories']);
  }


  onSearch() {
    this.navCtrl.navigateForward([`/stores/storesearch/${this.categoryId}`, { searchName: this.categoryName }]);
  }

  async getObject(event?) {
    this.isLoading = true;
    const ret = await Storage.get({ key: 'usertempaddress1' });
    const storeLatLong = [];
    const customerLatLong = [];
    const city = JSON.parse(ret.value).city;
    const lat = JSON.parse(ret.value).lat;
    const long = JSON.parse(ret.value).long;
    this.city = city;
    this.authService.City = this.city;
    this.authService.Lat = lat;
    this.authService.Long = long;
    setTimeout(() => {
      this.storeService.fetchAllStoresBasedOnCity(this.city, '', this.categoryId, this.currentPage, this.pageSize)
      .subscribe((data: any) => {
        // console.log(data);
        this.isLoading = false;
        customerLatLong.push(new google.maps.LatLng(this.authService.Lat, this.authService.Long));
        this.loadedStores = this.loadedStores.concat(data.store);
        this.loadedStoresCount = data.store_total_count.stores_count;
        this.totalPages = Math.ceil(this.loadedStoresCount / this.pageSize);
        this.loadedStores.forEach((store: any) => {
          store.likedBy = true;
          store.distanceFromCustomer = '';
          storeLatLong.push(new google.maps.LatLng(store.latitude, store.longitude));
        });
        new google.maps.DistanceMatrixService().getDistanceMatrix({
          origins: storeLatLong,
          destinations: customerLatLong,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        }, (results: any) => {
          const distanceData = results.rows;
          // console.log(distanceData);
          if (distanceData.length > 0) {
            for (let i = 0; i < distanceData.length; i++) {
              this.loadedStores[i].distanceFromCustomer = distanceData[i].elements[0].distance.text;
              this.loadedStores[i].distanceFromCustomerValue = distanceData[i].elements[0].distance.value;
              this.loadedStores[i].timeFromCustomer = distanceData[i].elements[0].duration.text;
              this.loadedStores[i].timeFromCustomerValue = distanceData[i].elements[0].duration.value;
            }
          }
          this.ref.tick();
        });
        if (event) {
          event.target.complete();
        }
      }, (error) => {
        this.errorMessage = error;
      });
    }, 500);
  }
  loadMore(event) {
    if (this.currentPage === this.totalPages) {
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.getObject(event);
    }
  }

  ngOnDestroy() {
  }

  ionViewWillLeave() {
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }

}
