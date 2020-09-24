import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderPage } from './order.page';

const routes: Routes = [
  {
    path: '',
    component: OrderPage
  },
  {
    path: 'order-detail/:orderId',
    loadChildren: () => import('./order-detail/order-detail.module').then( m => m.OrderDetailPageModule)
  },
  {
    path: 'liveorders',
    loadChildren: () => import('./live-orders/live-orders.module').then( m => m.LiveOrdersPageModule)
  },
  {
    path: 'liveordertrackingdetail/:orderId',
    loadChildren: () => import('./live-order-tracking-detail/live-order-tracking-detail.module').
                        then( m => m.LiveOrderTrackingDetailPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderPageRoutingModule {}
