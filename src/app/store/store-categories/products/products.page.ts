import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController, Platform, IonInfiniteScroll } from '@ionic/angular';
import { StoreService } from '../../store.service';
import { CategoriesService } from '../../../home/categories/categories.service';
import { AuthService } from '../../../auth/auth.service';
import { Product } from './product.model';
import { CartService, CartItem } from '../../../cart/cart.service';
import { DeliveryAddressService } from '../../../delivery-address/delivery-address.service';
import { from } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

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
  // storeProducts: Product[] = [];
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
    this.pet = "0";
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
      this.skeletonStoreCount = new Array(10);
      this.storecategoryId = +data.get('storecategoryId');
      this.storeId = +data.get('storeId');
      this.categoryId = +data.get('categoryId');
      console.log('store id' + this.storeId);
      console.log('storecategoryId' + this.storecategoryId);
      console.log('category id' + this.categoryId);
      this.loadedStoreCategoryInfo = this.storeService.StoreCategory;
      this.pageTitle = this.loadedStoreCategoryInfo.name;
    });
  }

  ionViewWillEnter() {
    this.storeProductsCount = 0;
    this.currentPage = 1;
    // this.storeProducts = [];
    this.storeProducts1 = [];
    this.loadedStore = this.storeService.StoreInfo;
    console.log(this.loadedStore);
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.navCtrl.pop();
    });
    this.getStoreProducts(this.productSubCategoryId);
    this.cartService.getAllCartItems().subscribe((data) => {
      this.cartList = JSON.parse(data.value);
    });
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

  getStoreProducts(categoryId, event?) {
    this.isLoading = true;
    setTimeout(() => {
      console.log('category_mapping_id' + this.storecategoryId);
      console.log('sub_category_id' + this.categoryId);
      this.storeService.fetchStoreProducts(this.storecategoryId, this.storeId, this.currentPage, this.pageSize, categoryId)
        .subscribe((data: any) => {
          console.log(data);
          this.isLoading = false;
          // this.storeProducts = this.storeProducts1.concat(data.store_products_instock__info);
          this.storeProductsCount = data.store_products_count[0].store_products_count;
          this.totalPages = Math.ceil(this.storeProductsCount / this.pageSize);
          this.storeProducts1 = this.storeProducts1.concat(JSON.parse(JSON.stringify(data.store_products_instock__info)));
          this.outOfStockProducts = data.store_products_outofstock__info;
          if (this.storeSubCategories.length <= 0) {
            this.storeSubCategories = data.store_sub_categories_info;
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
        console.log('fffff');
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
                      this.addItemsToCart(product, 1);
                      this.cartService.removeVoucher();
                      this.deliveryAddressService.removeDeliveryInstructions();
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
        if (this.storeProducts1[itemIndex].quantity_added >= 10) {
          this.alertCtrl
            .create({
              header: 'Cart',
              message: 'You can\'t add more quantity of this product',
              buttons: ['Okay']
            })
            .then(alertEl => alertEl.present());
        } else {
          this.storeProducts1[itemIndex].quantity_added += 1;
          this.addItemsToCart(product, 1);
        }
      }
    });
  }

  removeItem(item: Product, quantity: number) {
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
          this.cartService.getAllCartItems().subscribe((data2) => {
            this.cartList = JSON.parse(data2.value);
          });
        });
      }
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
