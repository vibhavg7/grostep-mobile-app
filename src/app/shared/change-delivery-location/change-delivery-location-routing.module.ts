import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeDeliveryLocationPage } from './change-delivery-location.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeDeliveryLocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeDeliveryLocationPageRoutingModule {}
