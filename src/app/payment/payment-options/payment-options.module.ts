import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentOptionsPageRoutingModule } from './payment-options-routing.module';

import { PaymentOptionsPage } from './payment-options.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentOptionsPageRoutingModule
  ],
  declarations: [PaymentOptionsPage],
  entryComponents: []
})
export class PaymentOptionsPageModule {}
