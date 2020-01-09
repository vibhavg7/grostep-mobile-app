import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifypasswordPage } from './verifypassword.page';

const routes: Routes = [
  {
    path: '',
    component: VerifypasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifypasswordPageRoutingModule {}
