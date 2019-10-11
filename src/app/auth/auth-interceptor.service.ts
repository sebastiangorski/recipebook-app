import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpParams } from '@angular/common/http';

import { AuthService } from './auth.service';
import { take, exhaustMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService, private store: Store<fromApp.AppState>) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth').pipe(
      take(1),
      map(authState => {
        return authState.user; // Simply selecting 'auth' in store is not enough because its an object with user property
      }),
      exhaustMap(user => {
      if (!user) { // Check if we don't have a user
        return next.handle(req);
      } // Only add token if we have a user
      const modifiedReq = req.clone({params: new HttpParams().set('auth', user.token)});
      return next.handle(modifiedReq);
    })
  );
  }
}

// For Firebase and Real Time Database REST API we add a token as a query param in the URL. For other APIs you add it as a header in the request.
