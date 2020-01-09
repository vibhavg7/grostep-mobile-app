import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCategoriesPage } from './store-categories.page';

const routes: Routes = [
  {
    path: '',
    component: StoreCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreCategoriesPageRoutingModule {}
