import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddUserInfoPage } from './add-user-info.page';

const routes: Routes = [
  {
    path: '',
    component: AddUserInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddUserInfoPageRoutingModule {}
