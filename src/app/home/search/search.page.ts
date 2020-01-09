import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap, distinctUntilChanged, debounceTime, switchMap, map } from 'rxjs/operators';
import { StoreService } from '../../store/store.service';
import { of, Subscription } from 'rxjs';
import { filter } from 'minimatch';
import { Router } from '@angular/router';

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
  constructor(
      private formBuilder: FormBuilder,
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
                 (this.filterBy !== '' ? this.storeService.fetchAllStoresBasedOnZipCode('', this.filterBy) : of([]))))
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
    this.subscription.unsubscribe();
  }

}
