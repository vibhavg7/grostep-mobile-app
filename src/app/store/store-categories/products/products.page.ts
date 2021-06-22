import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController, Platform, IonInfiniteScroll } from '@ionic/angular';
import { StoreService } from '../../store.service';
import { CategoriesService } from '../../../home/categories/categories.service';
import { AuthService } from '../../../auth/auth.service';
import { Product } from './product.model';
import { CartService, CartItem } from '../../../cart/cart.service';
import { DeliveryAddressService } from '../../../delivery-address/delivery-address.service';
import { from, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  chargeableDeliveryCost: any = 0;
  deliveryInstructions: any;
  slot: any;
  pricingDetails: any;
  outOfStockProducts: any = [];
  totalPages: number;
  storeProductsCount = 0;
  loadedStore: any;
  pet: string;
  @ViewChild('myInput', { static: false }) myInput: any;
  cartList: Array<CartItem>;
  categoryId: number;
  productSubCategoryId: any = '';
  storeSubCategories: any = [];
  errorMessage: any;
  pageTitle: any = 'Store Products';
  storecategoryId: number;
  storeId: number;
  skeletonStoreCount;
  isLoading = false;
  loadedStoreCategoryInfo: any;
  searchCriteriaForm: FormGroup;
  storeProducts1: Product[] = [];
  currentPage = 1;
  pageSize = 10;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;
  constructor(
    private activatedRoute: ActivatedRoute,
    private platform: Platform,
    private categoryService: CategoriesService,
    private auth: AuthService,
    private cartService: CartService,
    private alertCtrl: AlertController,
    private router: Router,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private storeService: StoreService,
    private deliveryAddressService: DeliveryAddressService
  ) {
    // tslint:disable-next-line:quotemark
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
  }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('categoryId') || !data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.pet = '0';
      this.storeProductsCount = 0;
      this.currentPage = 1;
      this.skeletonStoreCount = new Array(10);
      this.storeProducts1 = [];
      this.storecategoryId = +data.get('storecategoryId');
      this.storeId = +data.get('storeId');
      this.categoryId = +data.get('categoryId');
      this.loadedStoreCategoryInfo = this.storeService.StoreCategory;
      this.pageTitle = this.loadedStoreCategoryInfo.name;
      this.loadedStore = this.storeService.StoreInfo;
      console.log(this.loadedStore);
    });
  }

  ionViewWillEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });

    this.getStoreProducts(this.productSubCategoryId);
  }

  segmentChanged(ev: any) {
    const id = ev.detail.value;
    this.productSubCategoryId = +id;
    this.storeProductsCount = 0;
    this.currentPage = 1;
    this.storeProducts1 = [];
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
    this.getStoreProducts(id);
    // this.filterProductsCategoryWise(+id);
  }

  // filterProductsCategoryWise(subCategoryId) {
  //   if (subCategoryId !== 0) {
  //     this.storeProducts1 = this.storeProducts.filter((product: any) => {
  //       return product.sub_category_id === +subCategoryId;
  //     });
  //   } else {
  //     this.storeProducts1 = this.storeProducts;
  //   }
  // }

  filterItem(value) {
    // if (!value) {
    //   this.storeProducts1 = this.storeProducts;
    // }
    // this.storeProducts1 = this.storeProducts.filter(
    //   item => item.product_name.replace(/\s/g, '').toLowerCase().indexOf(value.toLowerCase()) > -1
    // );
  }

  compareAddedCartWithStoreProduct(storeProducts, cartProducts) {
    let newStoreProducts = [];
    if (cartProducts.length > 0 && storeProducts.length > 0) {
      storeProducts.forEach((product: any) => {
        const result = cartProducts.find(el => +el.store_product_mapping_id === +product.store_product_mapping_id);
        if (result) {
          product.added = true;
          product.quantity_added = result.quantity;
        }
        newStoreProducts.push(product);
      });
    } else {
      newStoreProducts = storeProducts;
    }
    // console.log(newStoreProducts);
    return newStoreProducts;
  }

  getStoreProducts(categoryId, event?) {
    this.isLoading = true;
    setTimeout(() => {
      forkJoin(this.cartService.getAllCartItems(),
        this.storeService.fetchStoreProducts(this.storecategoryId, this.storeId, this.currentPage, this.pageSize, categoryId))
        .subscribe((data) => {
          this.isLoading = false;
          const parsedCartData = JSON.parse(data[0].value);
          console.log(parsedCartData);
          if (parsedCartData && Object.keys(parsedCartData).length > 0 && parsedCartData.constructor === Object) {
            console.log('inside');
            this.cartList = JSON.parse(data[0].value).items;
            this.deliveryInstructions = parsedCartData.deliveryInstructions;
            this.slot = parsedCartData.slot;
            this.chargeableDeliveryCost = parsedCartData.chargeableDeliveryCost;
          } else {
            console.log('inside1');
            this.cartList = [];
          }
          this.storeProductsCount = data[1].store_products_count[0].store_products_count;
          this.totalPages = Math.ceil(this.storeProductsCount / this.pageSize);
          this.storeProducts1 = this.compareAddedCartWithStoreProduct(
            this.storeProducts1.concat(JSON.parse(JSON.stringify(data[1].store_products_instock__info))), this.cartList);
          this.outOfStockProducts = this.compareAddedCartWithStoreProduct(data[1].store_products_outofstock__info, this.cartList);
          if (this.storeSubCategories.length <= 0) {
            this.storeSubCategories = data[1].store_sub_categories_info;
          }
          if (this.totalPages === 0 && this.outOfStockProducts.length > 0) {
            this.storeProducts1 = this.storeProducts1.concat(this.outOfStockProducts);
          }
          if (this.currentPage === this.totalPages) {
            this.storeProducts1 = this.storeProducts1.concat(this.outOfStockProducts);
          }
          // const unique = [...new Set(this.storeProducts1.map(item => item.sub_category_id))];
          // this.filterSubCategory(data.store_sub_categories_info, unique);
          if (event) {
            event.target.complete();
          }
        }, (error) => {
          this.errorMessage = error;
        });
    }, 500);
  }

  filterSubCategory(storeSubCategories, uniquevalues) {
    this.storeSubCategories = storeSubCategories.filter((val) => {
      if (uniquevalues.indexOf(val.category_id) !== -1) {
        return val;
      }
    });
  }

  addProduct(product: any) {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
      if (data1.storeInfo[0].closed === 1) {
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
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
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
                    }
                  },
                  {
                    text: 'Remove',
                    cssClass: 'removecss',
                    handler: () => {
                      this.cartList = this.cartService.removeAllCartItems();
                      this.cartService.removeVoucher();
                      this.deliveryInstructions = '';
                      this.chargeableDeliveryCost = 0;
                      this.slot = {};
                      this.addItemsToCart(product, 1);

                      // to add logic here
                      const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id ===
                        product.store_product_mapping_id);
                      this.storeProducts1[itemIndex].added = true;
                      if (this.storeProducts1[itemIndex].quantity_added == null ||
                        this.storeProducts1[itemIndex].quantity_added === undefined ||
                        this.storeProducts1[itemIndex].quantity_added === 0) {
                        this.storeProducts1[itemIndex].quantity_added = 1;
                      }
                    }
                  }
                ]
              })
              .then(alertEl => alertEl.present());
          } else {
            this.addItemsToCart(product, 1);
            const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
            this.storeProducts1[itemIndex].added = true;
            if (this.storeProducts1[itemIndex].quantity_added == null ||
              this.storeProducts1[itemIndex].quantity_added === undefined ||
              this.storeProducts1[itemIndex].quantity_added === 0) {
              this.storeProducts1[itemIndex].quantity_added = 1;
            }
          }
        } else {
          this.addItemsToCart(product, 1);
          const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
          this.storeProducts1[itemIndex].added = true;
          if (this.storeProducts1[itemIndex].quantity_added == null ||
            this.storeProducts1[itemIndex].quantity_added === undefined ||
            this.storeProducts1[itemIndex].quantity_added === 0) {
            this.storeProducts1[itemIndex].quantity_added = 1;
          }
        }
      }
    });
  }

  async setAndGetCart(parsedData) {
    // console.log(parsedData);
    const ret1 = await Storage.get({ key: 'cartList' });
    const cartId = JSON.parse(ret1.value).cart_id;
    const cartObj: any = {};
    cartObj.chargeableDeliveryCost = this.chargeableDeliveryCost;
    cartObj.count = parsedData.length;
    cartObj.items = parsedData;
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
    cartObj.total = parsedData.reduce((sum, current) => {
      return sum + (current.store_selling_price * current.quantity);
    }, 0);
    // console.log(cartObj);
    this.cartService.setCartObject(cartObj);
    this.cartService.getAllCartItems().subscribe((data1) => {
      this.cartList = JSON.parse(data1.value).items;
    });
  }

  async addItemsToCart(product, quantity = 1) {
    const list: Array<CartItem> = [];
    const id = +product.store_product_mapping_id;
    let isExists = false;
    let ret = await Storage.get({ key: 'cartList' });
    let parsedData = JSON.parse(ret.value);
    // console.log(parsedData);
    if (parsedData === null) {
      const cartList: any = {};
      cartList.count = 0;
      cartList.total = 0;
      cartList.chargeableDeliveryCost = 0;
      cartList.slot = {};
      cartList.pricingDetails = {};
      cartList.items = [];
      cartList.deliveryInstructions = '';
      cartList.paymentMode = 0;
      cartList.uniqueSkuInCart = 0;
      this.cartService.setCartObject(cartList);
      ret = await Storage.get({ key: 'cartList' });
      parsedData = JSON.parse(ret.value);
    }
    if (parsedData && Object.keys(parsedData).length > 0 && parsedData.constructor === Object && parsedData.items.length > 0) {
      console.log('inside4');
      const cartData = parsedData.items;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < cartData.length; i++) {
        if (+cartData[i].store_product_mapping_id === +id) {
          isExists = true;
          cartData[i].quantity += quantity;
          this.setAndGetCart(cartData);
          break;
        } else {
          isExists = false;
        }
      }
      if (!isExists) {
        cartData.push(new CartItem(product, quantity));
        this.setAndGetCart(cartData);
      }
    } else {
      list.push(new CartItem(product, quantity));
      this.setAndGetCart(list);
    }
  }


  addtocart(product: Product) {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
      if (data1.storeInfo[0].closed === 1) {
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
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
        // console.log(itemIndex);
        if (this.storeProducts1[itemIndex].quantity_added >= product.store_product_caping) {
          this.alertCtrl
            .create({
              header: 'Cart',
              message: 'You can\'t add more quantity of this product',
              buttons: ['Okay']
            })
            .then(alertEl => alertEl.present());
        } else {
          this.storeProducts1[itemIndex].quantity_added += 1;
          // console.log(product);
          this.addItemsToCart(product, 1);
        }
      }
    });
  }

  removeItem(item: Product, quantity: number) {
    const id = item.store_product_mapping_id;
    this.cartService.getAllCartItems().subscribe((data) => {
      const parsedData = JSON.parse(data.value).items;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < parsedData.length; i++) {
        if (+parsedData[i].store_product_mapping_id === +id) {
          if (+parsedData[i].quantity === 1) {
            parsedData.splice(i, 1);
          } else {
            parsedData[i].quantity -= quantity;
          }
          break;
        }
      }
      this.setAndGetCart(parsedData);
      // this.cartService.setCartObject(parsedData);
      // this.cartService.getAllCartItems().subscribe((data2) => {
      //   this.cartList = JSON.parse(data2.value);
      // });
    });
  }

  removeItemfromCart(product: Product) {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
      if (data1.storeInfo[0].closed === 1) {
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
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
        this.storeProducts1[itemIndex].quantity_added -= 1;
        if (this.storeProducts1[itemIndex].quantity_added > 0) {
          this.removeItem(product, 1);
        } else if (this.storeProducts1[itemIndex].quantity_added === 0) {
          this.storeProducts1[itemIndex].added = false;
          this.removeItem(product, 1);
        } else if (this.storeProducts1[itemIndex].quantity_added < 0) {
          this.alertCtrl
            .create({
              header: 'Authentication failed',
              message: 'Quantity is 1, you can\'t reduce it.',
              buttons: ['Okay']
            })
            .then(alertEl => alertEl.present());
        }
      }
    });
  }

  viewCart() {
    this.storeService.storeClosingStatus(this.storeId).subscribe((data1) => {
      if (data1.storeInfo[0].closed === 1) {
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
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      } else {
        this.router.navigate(['/cart', { storeId: this.storeId, categoryId: this.categoryId, storecategoryId: this.storecategoryId }]);
      }
    });
  }

  loadMore(event) {
    if (this.currentPage === this.totalPages || this.totalPages === 0) {
      // this.storeProducts1.concat(this.outOfStockProducts);
      event.target.disabled = true;
    } else {
      this.currentPage++;
      this.getStoreProducts(this.productSubCategoryId, event);
    }
  }

  seachBoxActive() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 0);
  }

  onSearch() {
    console.log('onSearch');
    // this.navCtrl.navigateForward([`/stores/storesearch/${this.categoryId}`, { searchName: this.categoryName }]);
  }

  ionViewWillLeave() {
    this.infiniteScroll.disabled = false;
    this.infiniteScroll.position = 'bottom';
  }

}
