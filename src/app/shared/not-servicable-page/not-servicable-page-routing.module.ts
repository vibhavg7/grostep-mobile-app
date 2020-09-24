import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotServicablePagePage } from './not-servicable-page.page';

const routes: Routes = [
  {
    path: '',
    component: NotServicablePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotServicablePagePageRoutingModule {}
