import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiveOrderTrackingDetailPage } from './live-order-tracking-detail.page';

const routes: Routes = [
  {
    path: '',
    component: LiveOrderTrackingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveOrderTrackingDetailPageRoutingModule {}
