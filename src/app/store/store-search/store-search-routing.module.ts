import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreSearchPage } from './store-search.page';

const routes: Routes = [
  {
    path: '',
    component: StoreSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreSearchPageRoutingModule {}
