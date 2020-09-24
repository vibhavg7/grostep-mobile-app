import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiveOrdersPage } from './live-orders.page';

const routes: Routes = [
  {
    path: '',
    component: LiveOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveOrdersPageRoutingModule {}
