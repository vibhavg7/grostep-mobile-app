import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StorePage } from './store.page';

const routes: Routes = [
  {
    path: '',
    component: StorePage
  },
  {
    path: ':storeId/storecategories/:storecategoryId/storeproducts',
    loadChildren: () => import('./store-categories/products/products.module').then( m => m.ProductsPageModule)
  },
  {
    path: ':storeId/storecategories',
    loadChildren: () => import('./store-categories/store-categories.module').then( m => m.StoreCategoriesPageModule)
  },
  {
    path: 'favourite-store',
    loadChildren: () => import('./favourite-store/favourite-store.module').then( m => m.FavouriteStorePageModule)
  },
  {
    path: 'storesearch/:categoryId',
    loadChildren: () => import('./store-search/store-search.module').then( m => m.StoreSearchPageModule)
  },
  {
    path: 'grostepstore',
    loadChildren: () => import('./grostep-store/grostep-store.module').then( m => m.GrostepStorePageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorePageRoutingModule {}
