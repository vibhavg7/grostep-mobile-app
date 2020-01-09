import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { StoreService } from '../../store.service';
import { CategoriesService } from '../../../home/categories/categories.service';
import { AuthService } from '../../../auth/auth.service';
import { Product } from './product.model';
import { CartService, CartItem } from '../../../cart/cart.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  pet: string;
  getGrandTotal: number;
  cartList: Array<CartItem>;
  categoryId: number;
  storeSubCategories: any = [];
  errorMessage: any;
  pageTitle: any = 'Store Products';
  storecategoryId: number;
  storeId: number;
  isLoading = false;
  loadedStoreCategoryInfo: any;
  storeProducts: Product[];
  storeProducts1: Product[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoriesService,
    private auth: AuthService,
    private cartService: CartService,
    private alertCtrl: AlertController,
    private router: Router,
    private navCtrl: NavController,
    private storeService: StoreService
  ) {
    // tslint:disable-next-line:quotemark
    this.pet = "0";
  }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      console.log(data);
      if (!data.has('categoryId') || !data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storecategoryId = +data.get('storecategoryId');
      this.storeId = +data.get('storeId');
      this.categoryId = +data.get('categoryId');
      this.loadedStoreCategoryInfo = this.storeService.StoreCategory;
      this.pageTitle = this.loadedStoreCategoryInfo.name;
    });
  }

  ionViewWillEnter() {
    this.getStoreProducts();
    this.cartList = this.cartService.getAllCartItems();
    this.getGrandTotal = this.cartService.getGrandTotal();
  }

  segmentChanged(ev: any) {
    const id = ev.detail.value;
    this.filterProductsCategoryWise(+id);
  }

  filterProductsCategoryWise(subCategoryId) {
    if (subCategoryId !== 0) {
      this.storeProducts1 = this.storeProducts.filter((product: any) => {
        return product.sub_category_id === +subCategoryId;
      });
    } else {
      this.storeProducts1 = this.storeProducts;
    }
  }

  getStoreProducts() {
    this.isLoading = true;
    this.storeService.fetchStoreProducts(this.storecategoryId, this.storeId)
      .subscribe((data: any) => {
        this.isLoading = false;
        this.storeProducts = data.store_products_info;
        this.storeProducts1 = JSON.parse(JSON.stringify(data.store_products_info));
        this.storeSubCategories = data.store_sub_categories_info;
      }, (error) => {
        this.errorMessage = error;
      });
  }

  addProduct(product: any) {
    if (this.cartList.length > 0 && this.cartList[0].store_id !== product.store_id) {
      this.alertCtrl
        .create({
          header: 'Cart Error',
          message: 'Are you sure you want to drop items from previous store',
          buttons: [
            {
              text: 'Cancel',
              cssClass: 'cancelcss',
              handler: () => {
                console.log('Cancel clicked');
                this.cartService.addItem(product, 1);
                this.getGrandTotal = this.cartService.getGrandTotal();
                const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
                this.storeProducts1[itemIndex].added = true;
                if (this.storeProducts1[itemIndex].quantity_added == null ||
                  this.storeProducts1[itemIndex].quantity_added === undefined ||
                  this.storeProducts1[itemIndex].quantity_added === 0) {
                  this.storeProducts1[itemIndex].quantity_added = 1;
                }
              }
            },
            {
              text: 'Remove',
              cssClass: 'removecss',
              handler: () => {
                this.cartList = this.cartService.removeAllCartItems();
                this.cartService.addItem(product, 1);
                this.getGrandTotal = this.cartService.getGrandTotal();
                const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
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

      this.cartService.addItem(product, 1);
      this.getGrandTotal = this.cartService.getGrandTotal();
      const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
      this.storeProducts1[itemIndex].added = true;
      if (this.storeProducts1[itemIndex].quantity_added == null ||
        this.storeProducts1[itemIndex].quantity_added === undefined ||
        this.storeProducts1[itemIndex].quantity_added === 0) {
        this.storeProducts1[itemIndex].quantity_added = 1;
      }
    }

  }

  addtocart(product: Product) {
    const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
    this.storeProducts1[itemIndex].quantity_added += 1;
    this.cartService.addItem(product, 1);
    this.getGrandTotal = this.cartService.getGrandTotal();
  }

  removeItemfromCart(product: Product) {
    const itemIndex = this.storeProducts1.findIndex(item => item.store_product_mapping_id === product.store_product_mapping_id);
    this.storeProducts1[itemIndex].quantity_added -= 1;
    if (this.storeProducts1[itemIndex].quantity_added > 0) {
      this.cartService.removeItem(product, 1);
      this.getGrandTotal = this.cartService.getGrandTotal();
    } else if (this.storeProducts1[itemIndex].quantity_added === 0) {
      this.storeProducts1[itemIndex].added = false;
      this.cartService.removeItem(product, 1);
      this.getGrandTotal = this.cartService.getGrandTotal();
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

  viewCart() {
    this.router.navigate(['/cart', { storeId: this.storeId, categoryId: this.categoryId, storecategoryId: this.storecategoryId }]);
    //  this.router.navigate(['/', 'cart', this.storeId]);
  }

}
