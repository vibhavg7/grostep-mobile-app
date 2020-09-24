import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDeliveryAddressPage } from './add-delivery-address.page';
import { AddAddressResolverService } from '../add-address-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: AddDeliveryAddressPage,
    resolve: { resolvedAddress: AddAddressResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDeliveryAddressPageRoutingModule {}
