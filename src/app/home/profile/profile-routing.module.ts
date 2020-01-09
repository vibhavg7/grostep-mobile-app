import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  // ,
  // {
  //   path: 'delivery-address',
  //   loadChildren: () => import('../../delivery-address/delivery-address.module').then( m => m.DeliveryAddressPageModule)
  // },
  {
    path: 'password-management',
    loadChildren: () => import('./password-management/password-management.module').then( m => m.PasswordManagementPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
