import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryInstructionsPageRoutingModule } from './delivery-instructions-routing.module';

import { DeliveryInstructionsPage } from './delivery-instructions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryInstructionsPageRoutingModule
  ],
  declarations: [DeliveryInstructionsPage]
})
export class DeliveryInstructionsPageModule {}
