import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
    {
        path: 'tabs',
        component: HomePage,
        children: [
            {
                path: 'categories',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesPageModule)
                    }
                ]
            },
            {
                path: 'search',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./search/search.module').then(m => m.SearchPageModule)
                    }
                ]
            },
            {
                path: 'cart',
                // canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../cart/cart.module').then(m => m.CartPageModule)
                    }
                ]
            },
            {
                path: 'profile',
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
                    }
                ]
            },
            {
                path: '',
                redirectTo: '/home/tabs/categories',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/home/tabs/categories',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HomeRoutingModule {

}
