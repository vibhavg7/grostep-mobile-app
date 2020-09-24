import { Component, OnInit, ApplicationRef } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { StoreService } from '../store.service';
import { distinctUntilChanged, tap, debounceTime, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem, CartService } from '../../cart/cart.service';
import { DeliveryAddressService } from '../../delivery-address/delivery-address.service';
import { Product } from '../store-categories/products/product.model';
import {
  Plugins,
  Capacitor
} from '@capacitor/core';
const { Storage } = Plugins;
@Component({
  selector: 'app-store-search',
  templateUrl: './store-search.page.html',
  styleUrls: ['./store-search.page.scss'],
})
export class StoreSearchPage implements OnInit {
  storedCity: any;
  totalAmount: number;
  storeId: number;
  searchBarName: any;
  getGrandTotal: number;
  loadedStoreProducts: any;
  categoryId: any;
  cartList: Array<CartItem>;
  pet: string;
  storeproductsloaded = false;
  loadedProductStoreWise: any;
  loadedStores: any;
  filterBy: any;
  isLoading = false;
  searchCriteriaForm: FormGroup;
  queryField: FormControl = new FormControl();
  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
    private cartService: CartService,
    private ref: ApplicationRef,
    private alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private storeService: StoreService,
    private deliveryAddressService: DeliveryAddressService
  ) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
    // tslint:disable-next-line:quotemark
    this.pet = "0";
  }

  ionViewWillEnter() {
    console.log('store search page');
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (+this.categoryId === 0) {
        this.navCtrl.navigateRoot(['/home/tabs/search']);
      } else {
        this.navCtrl.pop();
      }
    });
    this.cartService.getAllCartItems().subscribe((data) => {
      this.cartList = JSON.parse(data.value);
      if (this.cartList !== null && this.cartList.length > 0) {
        this.calculateTotalAmount(this.cartList);
      }
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

  async getDeliveryLocationCity(data: any) {
    const ret = await Storage.get({ key: 'usertempaddress1' });
    const storedCity = JSON.parse(ret.value).city;
    this.storedCity = storedCity;
    this.categoryId = +data.get('categoryId');
    this.storeId = +data.get('storeId');
    this.searchBarName = data.get('searchName');
    if (this.searchBarName === null) {
      this.searchBarName = 'store or products';
    }
  }


  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('categoryId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.getDeliveryLocationCity(data);
    });
    this.queryField.valueChanges.pipe(
      tap((data) => {
        console.log(data);
        this.isLoading = true;
        console.log(this.storedCity);
      }),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((query) => this.storeService.searchStoreAndProductsBasedOnName('', query, this.categoryId, this.storeId, this.storedCity))
    )
      .subscribe((response: any) => {
        this.loadedStores = response.store;
        this.loadedStoreProducts = response.products;
        this.loadedStoreProducts.forEach(storeData => {
          storeData.productsData.forEach((storeProductData: any) => {
            storeProductData.quantity_added = 0;
            storeProductData.added = false;
          });
        });
        this.isLoading = false;
        this.storeproductsloaded = true;
        this.ref.tick();
      }, (error: any) => {
        this.isLoading = false;
        this.storeproductsloaded = true;
      });
  }

  addItemsToCart(product, quantity = 1) {
    this.cartService.getAllCartItems().subscribe((data) => {
      const id = product.store_product_mapping_id;
      let isExists = false;
      const list: Array<CartItem> = [];
      const parsedData = JSON.parse(data.value);
      if (parsedData !== null) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < parsedData.length; i++) {
          if (parsedData[i].id === id) {
            parsedData[i].quantity += quantity;
            isExists = true;
            this.cartService.setCartObject(parsedData);
            this.cartService.getAllCartItems().subscribe((data1) => {
              console.log(JSON.parse(data1.value));
              this.cartList = JSON.parse(data1.value);
            });
          } else {
            isExists = false;
          }
        }
        if (!isExists) {
          parsedData.push(new CartItem(product, quantity));
          this.cartService.setCartObject(parsedData);
          this.cartService.getAllCartItems().subscribe((data1) => {
            this.cartList = JSON.parse(data1.value);
          });
        }
      } else {
        list.push(new CartItem(product, quantity));
        this.cartService.setCartObject(list);
        this.cartService.getAllCartItems().subscribe((data1) => {
          this.cartList = JSON.parse(data1.value);
        });
      }
    });
  }

  addProduct(product: any, storeid: any) {
    if (this.cartList != null && this.cartList.length > 0) {
      if (this.cartList[0].store_id !== product.store_id) {
        this.alertCtrl
          .create({
            header: 'Remove cart item?',
            message: 'Are you sure you want to remove items from previous store',
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
                  this.loadedStoreProducts.forEach(storeData => {
                    storeData.productsData.forEach(storeProductData => {
                      storeProductData.quantity_added = 0;
                      storeProductData.added = false;
                    });
                  });
                  this.cartList = this.cartService.removeAllCartItems();
                  this.cartService.removeVoucher();
                  this.deliveryAddressService.removeDeliveryInstructions();
                  const storeInfoObj: any = {};
                  storeInfoObj.store_name = product.store_name;
                  storeInfoObj.address = product.address;
                  storeInfoObj.token = product.token;
                  storeInfoObj.latitude = product.latitude;
                  storeInfoObj.longitude = product.longitude;
                  this.storeService.StoreInfo = storeInfoObj;
                  this.addItemsToCart(product, 1);
                  const storeIndex = this.loadedStoreProducts.findIndex(item => item.store_id === storeid);
                  const itemIndex = this.loadedStoreProducts[storeIndex].productsData.findIndex(item =>
                    item.store_product_mapping_id === product.store_product_mapping_id);
                  this.loadedStoreProducts[storeIndex].productsData[itemIndex].added = true;
                  if (this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added == null ||
                    this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === undefined ||
                    this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === 0) {
                    this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added = 1;
                  }
                  this.ref.tick();
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        const storeInfoObj: any = {};
        storeInfoObj.store_name = product.store_name;
        storeInfoObj.address = product.address;
        storeInfoObj.token = product.token;
        storeInfoObj.latitude = product.latitude;
        storeInfoObj.longitude = product.longitude;
        this.storeService.StoreInfo = storeInfoObj;
        this.addItemsToCart(product, 1);
        const storeIndex = this.loadedStoreProducts.findIndex(item => item.store_id === storeid);
        const itemIndex = this.loadedStoreProducts[storeIndex].productsData.findIndex(item =>
          item.store_product_mapping_id === product.store_product_mapping_id);
        this.loadedStoreProducts[storeIndex].productsData[itemIndex].added = true;
        if (this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added == null ||
          this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === undefined ||
          this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === 0) {
          this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added = 1;
        }
        console.log(this.loadedStoreProducts);
        this.ref.tick();
      }
    } else {
      const storeInfoObj: any = {};
      storeInfoObj.store_name = product.store_name;
      storeInfoObj.address = product.address;
      storeInfoObj.token = product.token;
      storeInfoObj.latitude = product.latitude;
      storeInfoObj.longitude = product.longitude;
      this.storeService.StoreInfo = storeInfoObj;
      this.addItemsToCart(product, 1);
      const storeIndex = this.loadedStoreProducts.findIndex(item => item.store_id === storeid);
      const itemIndex = this.loadedStoreProducts[storeIndex].productsData.findIndex(item =>
        item.store_product_mapping_id === product.store_product_mapping_id);
      this.loadedStoreProducts[storeIndex].productsData[itemIndex].added = true;
      if (this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added == null ||
        this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === undefined ||
        this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added === 0) {
        this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added = 1;
      }
    }

  }

  removeItem(item: Product, quantity: number) {
    const id = item.store_product_mapping_id;
    this.cartService.getAllCartItems().subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (parsedData[i].id === id) {
          if (parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          } else {
            parsedData[i].quantity -= quantity;
          }
          break;
        }
      }
      this.cartService.setCartObject(parsedData);
      this.cartService.getAllCartItems().subscribe((data1) => {
        this.cartList = JSON.parse(data1.value);
      });
    });
  }

  removeItemfromCart(product: any, storeid: any) {
    const storeIndex = this.loadedStoreProducts.findIndex(item => item.store_id === storeid);
    const itemIndex = this.loadedStoreProducts[storeIndex].productsData.findIndex(item =>
      item.store_product_mapping_id === product.store_product_mapping_id);
    this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added -= 1;
    const quantity_added = this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added;
    if (quantity_added === 0) {
      this.loadedStoreProducts[storeIndex].productsData[itemIndex].added = false;
      this.removeItem(product, 1);
    } else {
      this.removeItem(product, 1);
    }
    // this.getGrandTotal = this.cartService.getGrandTotal();
    this.ref.tick();
  }

  addtocart(product: any, storeid: any) {
    const storeIndex = this.loadedStoreProducts.findIndex(item => item.store_id === storeid);
    const itemIndex = this.loadedStoreProducts[storeIndex].productsData.findIndex(item =>
      item.store_product_mapping_id === product.store_product_mapping_id);
    if (this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added >= 10) {
      this.alertCtrl
        .create({
          header: 'Cart',
          message: 'You can\'t add more quantity of this product',
          buttons: ['Okay']
        })
        .then(alertEl => alertEl.present());
    } else {
      this.loadedStoreProducts[storeIndex].productsData[itemIndex].quantity_added += 1;
      this.addItemsToCart(product, 1);
    }
  }

  getGrandProductTotal() {
    return this.totalAmount;
  }


  clickStore(storeId: number, closed: number) {
    // if (closed === 0) {
    const loadedStore = this.loadedStores.filter(data => data.store_id === +storeId);
    this.storeService.StoreInfo = loadedStore[0];
    this.router.navigate(['/', 'categories', this.categoryId, 'stores', storeId, 'storecategories']);
    // }
  }

  segmentChanged(ev: any) {
    const id = ev.detail.value;
    console.log(id);
    // this.filterProductsCategoryWise(+id);
  }

  viewCart() {
    this.cartService.getAllCartItems().subscribe((data) => {
      const parsedData = JSON.parse(data.value);
      console.log(parsedData);
      if (this.storeId === 0 && parsedData.length > 0) {
        this.storeId = parsedData[0].store_id;
      }
      this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
        console.log(data1);
        if (data1.storeInfo[0].closed === 1) {
          this.alertCtrl
            .create({
              header: 'Store Information',
              message: 'Store is closed. Please try from another store',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/', 'categories', this.categoryId, 'stores']);
                    // this.router.navigate(['']);
                  }
                }
              ]
            })
            .then(alertEl => alertEl.present());
        } else {
          this.router.navigate(['/cart', { storeId: this.storeId, categoryId: 0, storecategoryId: 0 }]);
        }
      });
    });
    // console.log(this.storeId);
    // console.log(this.cartService.getAllCartItems());
    // if (this.storeId === 0 && this.cartService.getAllCartItems().length > 0) {
    //   this.storeId = this.cartService.getAllCartItems()[0].store_id;
    // }
    // this.router.navigate(['/cart', { storeId: this.storeId, categoryId: 0, storecategoryId: 0 }]);
    // this.router.navigate(['/home/tabs/cart']);
    //  this.router.navigate(['/', 'cart', this.storeId]);
  }

  backToSearch() {
    if (+this.categoryId === 0) {
      this.navCtrl.navigateRoot(['/home/tabs/search']);
    } else {
      this.navCtrl.pop();
    }
  }
}

