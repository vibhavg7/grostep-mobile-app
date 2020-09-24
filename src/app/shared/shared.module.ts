import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferListComponent } from './offer-list/offer-list.component';
import { IonicModule } from '@ionic/angular';
import { AgmCoreModule } from '@agm/core';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { CustomerAddAddressComponent } from './customer-add-address/customer-add-address.component';
import { LiveOrderDetailComponent } from './live-order-detail/live-order-detail.component';
import { ShowImageModalComponent } from '../order/show-image-modal/show-image-modal.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    OfferListComponent,
    CustomerLoginComponent,
    CustomerAddAddressComponent,
    ShowImageModalComponent,
    LiveOrderDetailComponent,
    FeedbackFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyAvcDy5ZYc2ujCS6TTtI3RYX5QmuoV8Ffw'
      /* apiKey is required, unless you are a
      premium customer, in which case you can
      use clientId
      */
    }),
  ],
  entryComponents: [
    OfferListComponent,
    CustomerLoginComponent,
    CustomerAddAddressComponent,
    ShowImageModalComponent,
    LiveOrderDetailComponent,
    FeedbackFormComponent
  ],
  exports: [OfferListComponent, CustomerLoginComponent,
            LiveOrderDetailComponent,
            FeedbackFormComponent,
            CustomerAddAddressComponent]
})
export class SharedModule { }
