import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrostepStorePage } from './grostep-store.page';

const routes: Routes = [
  {
    path: '',
    component: GrostepStorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrostepStorePageRoutingModule {}
