import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryAddressPageRoutingModule } from './delivery-address-routing.module';

import { DeliveryAddressPage } from './delivery-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryAddressPageRoutingModule
  ],
  declarations: [DeliveryAddressPage]
})
export class DeliveryAddressPageModule {}
