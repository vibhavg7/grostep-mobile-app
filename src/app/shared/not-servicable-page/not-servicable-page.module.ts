import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotServicablePagePageRoutingModule } from './not-servicable-page-routing.module';

import { NotServicablePagePage } from './not-servicable-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotServicablePagePageRoutingModule
  ],
  declarations: [NotServicablePagePage]
})
export class NotServicablePagePageModule {}
