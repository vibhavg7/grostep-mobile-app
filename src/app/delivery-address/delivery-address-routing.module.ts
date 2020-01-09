import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryAddressPage } from './delivery-address.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryAddressPage
  },
  {
    path: 'add-delivery-address',
    loadChildren: () => import('./add-delivery-address/add-delivery-address.module').then( m => m.AddDeliveryAddressPageModule)
  },
  {
    path: 'delivery-options/:storeId',
    loadChildren: () => import('./delivery-options/delivery-options.module').then( m => m.DeliveryOptionsPageModule)
  },
  {
    path: 'delivery-instructions',
    loadChildren: () => import('./delivery-instructions/delivery-instructions.module').then( m => m.DeliveryInstructionsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryAddressPageRoutingModule {}
