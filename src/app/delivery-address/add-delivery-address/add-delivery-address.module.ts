import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDeliveryAddressPageRoutingModule } from './add-delivery-address-routing.module';

import { AddDeliveryAddressPage } from './add-delivery-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddDeliveryAddressPageRoutingModule
  ],
  declarations: [AddDeliveryAddressPage]
})
export class AddDeliveryAddressPageModule {}
