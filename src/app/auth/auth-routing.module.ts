import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';

const routes: Routes = [
  {
    path: '',
    component: AuthPage
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'verifypassword',
    loadChildren: () => import('./verifypassword/verifypassword.module').then( m => m.VerifypasswordPageModule)
  },
  {
    path: 'validate-otp/:customerId',
    loadChildren: () => import('./validate-otp/validate-otp.module').then( m => m.ValidateOtpPageModule)
  },
  {
    path: 'add-user-info',
    loadChildren: () => import('./add-user-info/add-user-info.module').then( m => m.AddUserInfoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
