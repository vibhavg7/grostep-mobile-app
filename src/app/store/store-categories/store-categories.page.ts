import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StoreService } from '../store.service';
import { CategoriesService } from '../../home/categories/categories.service';
@Component({
  selector: 'app-store-categories',
  templateUrl: './store-categories.page.html',
  styleUrls: ['./store-categories.page.scss'],
})
export class StoreCategoriesPage implements OnInit {

  errorMessage: any;
  storeId: number;
  categoryId: number;
  isLoading = false;
  loadedStore: any;
  storeCategories: any = [];
  constructor(private activatedRoute: ActivatedRoute,
              private categoryService: CategoriesService,
              private router: Router,
              private navCtrl: NavController,
              private storeService: StoreService) { }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((data: any) => {
      if (!data.has('categoryId') || !data.has('storeId')) {
        this.navCtrl.navigateBack('/home/tabs/categories');
        return;
      }
      this.storeId = +data.get('storeId');
      this.categoryId = +data.get('categoryId');
      this.loadedStore = this.storeService.StoreInfo;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.storeService.fetchStoreCategories(this.storeId)
    .subscribe((data: any) => {
      this.storeCategories = data.store_categories;
      this.isLoading = false;
    }, (error) => {
      this.errorMessage = error;
    });
  }

  clickStoreCategory(storeCategoryMappingId: number) {
    const loadedStoreCategory = this.storeCategories.filter(data => data.store_category_mapping_id === +storeCategoryMappingId);
    this.storeService.StoreCategory = loadedStoreCategory[0];
    this.router.navigate(['/', 'categories', this.categoryId,
                          'stores', this.storeId, 'storecategories', storeCategoryMappingId, 'storeproducts']);
  }
}
