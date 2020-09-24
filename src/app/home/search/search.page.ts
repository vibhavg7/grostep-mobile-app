import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap, distinctUntilChanged, debounceTime, switchMap, map } from 'rxjs/operators';
import { StoreService } from '../../store/store.service';
import { of, Subscription } from 'rxjs';
import { filter } from 'minimatch';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy {

  subscription: Subscription;
  loadedStoresCount: any;
  loadedStores: any;
  filterBy: any;
  isLoading: boolean;
  searchCriteriaForm: FormGroup;
  currentPage = 1;
  pageSize = 1000;
  constructor(
      private formBuilder: FormBuilder,
      private navCtrl: NavController,
      private router: Router,
      private storeService: StoreService) {
    this.searchCriteriaForm = this.formBuilder.group({
      searchCriteria: ['']
    });
   }

  ngOnInit() {
  }

  onChanges() {
    this.isLoading = true;
    this.subscription =  this.searchCriteriaForm.get('searchCriteria').valueChanges.pipe(
      tap(data => {}),
      map((data) => {
        return data.length > 2 ?  data : '';
      }),
      distinctUntilChanged(),
      debounceTime(800),
      switchMap(query => (this.filterBy = query, console.log(this.filterBy),
                 (this.filterBy !== '' ? this.storeService.fetchAllStoresBasedOnCity('',
                 this.filterBy, 0, this.currentPage, this.pageSize) : of([]))))
    )
      .subscribe((data: any) => {
              this.isLoading = false;
              this.loadedStores = data.store;
      });
  }


  clickStore(storeId: number) {
    const loadedStore = this.loadedStores.filter(data => data.store_id === +storeId);
    this.storeService.StoreInfo = loadedStore[0];
    this.router.navigate(['/', 'categories', 0, 'stores', storeId, 'storecategories']);
  }

  ngOnDestroy(): void {
    console.log(this.subscription);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSearch() {
    this.navCtrl.navigateForward([`/stores/storesearch/0`]);
  }

}
