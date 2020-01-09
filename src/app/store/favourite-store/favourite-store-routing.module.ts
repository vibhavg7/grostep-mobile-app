import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavouriteStorePage } from './favourite-store.page';

const routes: Routes = [
  {
    path: '',
    component: FavouriteStorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavouriteStorePageRoutingModule {}
