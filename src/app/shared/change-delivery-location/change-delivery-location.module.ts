import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeDeliveryLocationPageRoutingModule } from './change-delivery-location-routing.module';

import { ChangeDeliveryLocationPage } from './change-delivery-location.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeDeliveryLocationPageRoutingModule
  ],
  declarations: [ChangeDeliveryLocationPage]
})
export class ChangeDeliveryLocationPageModule {}
