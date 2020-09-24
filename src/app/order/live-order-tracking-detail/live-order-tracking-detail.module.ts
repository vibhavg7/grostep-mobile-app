import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiveOrderTrackingDetailPageRoutingModule } from './live-order-tracking-detail-routing.module';

import { LiveOrderTrackingDetailPage } from './live-order-tracking-detail.page';
import { SharedModule } from '../../shared/shared.module';
import { ShowImageModalComponent } from '../show-image-modal/show-image-modal.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: ''
      /* apiKey is required, unless you are a
      premium customer, in which case you can
      use clientId
      */
    }),
    FormsModule,
    IonicModule,
    LiveOrderTrackingDetailPageRoutingModule
  ],
  declarations: [LiveOrderTrackingDetailPage],
  entryComponents: []
})
export class LiveOrderTrackingDetailPageModule {}
