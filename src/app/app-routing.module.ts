import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'categories/:categoryId/stores',
    loadChildren: () => import('./store/store.module').then(m => m.StorePageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'stores',
    loadChildren: () => import('./store/store.module').then( m => m.StorePageModule)
  },
  {
    path: 'cart', // later we will auth guard
    loadChildren: () => import('./cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'offer', // later we will auth guard
    loadChildren: () => import('./offer/offer.module').then(m => m.OfferPageModule)
  },
  {
    path: 'delivery-address',
    loadChildren: () => import('./delivery-address/delivery-address.module').then( m => m.DeliveryAddressPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then( m => m.PaymentModule)
  },
  {
    path: 'order', // later we will auth guard
    loadChildren: () => import('./order/order.module').then(m => m.OrderPageModule)
  },
  {
    path: 'contactus',
    loadChildren: () => import('./contactus/contactus.module').then( m => m.ContactusPageModule)
  },
  {
    path: 'termsandconditions',
    loadChildren: () => import('./termsandconditions/termsandconditions.module').then( m => m.TermsandconditionsPageModule)
  },
  {
    path: 'aboutus',
    loadChildren: () => import('./aboutus/aboutus.module').then( m => m.AboutusPageModule)
  },
  {
    path: 'payment-options',
    loadChildren: () => import('./payment/payment-options/payment-options.module').then( m => m.PaymentOptionsPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
