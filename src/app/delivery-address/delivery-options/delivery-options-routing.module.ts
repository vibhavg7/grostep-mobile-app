import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryOptionsPage } from './delivery-options.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryOptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryOptionsPageRoutingModule {}
