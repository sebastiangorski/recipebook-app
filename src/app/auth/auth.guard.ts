import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { map, tap, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
    return this.authService.user.pipe(take(1), map(user => {
      const isAuth = !!user; // Converts truish value (like object from user subject) to true (a real boolean)
      if (isAuth) {
        return true;
      }
      return this.router.createUrlTree(['/auth']);
    }));
    // tap(isAuth => {
    //   if (!isAuth) {
    //     this.router.navigate(['/auth']);
    //   }
    // }));
  }
}

// With new Angular we can use urlTree instead of tap for rerouting user if not logged in.
