import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavouriteStorePageRoutingModule } from './favourite-store-routing.module';

import { FavouriteStorePage } from './favourite-store.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouriteStorePageRoutingModule
  ],
  declarations: [FavouriteStorePage]
})
export class FavouriteStorePageModule {}
