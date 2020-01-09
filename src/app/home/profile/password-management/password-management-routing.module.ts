import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordManagementPage } from './password-management.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordManagementPageRoutingModule {}
