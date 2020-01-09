import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    private TOKEN_KEY = 'token';
    constructor(private authService: AuthService, private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.checkLoggedIn(state.url);
    }

    checkLoggedIn(url: string) {
        // console.log(url);
        if (!!localStorage.getItem(this.TOKEN_KEY)) {
            // logged in so return true
            // console.log('Hi');
            return true;
        }
        this.authService.redirectUrl = url;
        this.router.navigate(['/', 'auth', 'login']);
        return false;

    }
}
