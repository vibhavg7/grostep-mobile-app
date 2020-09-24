import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailPageRoutingModule } from './order-detail-routing.module';

import { OrderDetailPage } from './order-detail.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    OrderDetailPageRoutingModule
  ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
