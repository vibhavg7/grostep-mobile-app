import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from './store.service';
import { NavController, AlertController } from '@ionic/angular';
import { CategoriesService } from '../home/categories/categories.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { tap, distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {

  filterBy: any;
  constructor(private activatedRoute: ActivatedRoute,
              private categoryService: CategoriesService,
              private router: Router,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              private formBuilder: FormBuilder,
              private storeService: StoreService) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
  }
  loadedStores: any;
  categoryName: any;
  loadedStoresCount: number;
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
      this.categoryId = +data.get('categoryId');
    });
    const storeCategories: any = this.categoryService.StoreCategories;
    const d1: any = storeCategories.filter(d => d.store_category_id === this.categoryId);
    this.categoryName = d1[0].store_category_name;
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.storeService.fetchAllStoresBasedOnZipCode('', '')
      .subscribe((data: any) => {
        this.isLoading = false;
        this.loadedStores = data.store;
        this.loadedStores.forEach(store => {
          store.likedBy = false;
        });
        this.loadedStoresCount = data.store_total_count.stores_count;
      }, (error) => {
        this.errorMessage = error;
      });
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
            console.log('Cancel clicked');
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

  clickStore(storeId: number) {
    const loadedStore = this.loadedStores.filter(data => data.store_id === +storeId);
    console.log(loadedStore[0]);
    this.storeService.StoreInfo = loadedStore[0];
    this.router.navigate(['/', 'categories', this.categoryId, 'stores', storeId, 'storecategories']);
  }

  onChanges() {
    this.isLoading = true;
    this.searchCriteriaForm.get('searchCriteria').valueChanges.pipe(tap(data => {
    }), distinctUntilChanged(), debounceTime(500),
      switchMap(query => (this.filterBy = query, this.storeService.fetchAllStoresBasedOnZipCode('', this.filterBy)))
    )
      .subscribe((data: any) => { this.isLoading = false; this.loadedStores = data.store;
                                  this.loadedStoresCount = data.store_total_count.stores_count; });
  }

}
