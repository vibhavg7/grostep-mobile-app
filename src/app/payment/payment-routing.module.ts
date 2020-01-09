import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'payment-options',
    loadChildren: () => import('./payment-options/payment-options.module').then( m => m.PaymentOptionsPageModule)
  },  {
    path: 'payment-status',
    loadChildren: () => import('./payment-status/payment-status.module').then( m => m.PaymentStatusPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
