import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GrostepStorePageRoutingModule } from './grostep-store-routing.module';

import { GrostepStorePage } from './grostep-store.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrostepStorePageRoutingModule
  ],
  declarations: [GrostepStorePage]
})
export class GrostepStorePageModule {}
