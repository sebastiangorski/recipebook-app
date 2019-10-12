import { Actions, ofType, Effect } from '@ngrx/effects'; // Different Actions then we implemented in actions files
import { Injectable } from '@angular/core';

import * as AuthActions from './auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean; // Optional - SignUp Request doesn't have this, but SignIn Request does
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({ // Will automatically get dispatched by NgRx Effects
      email: email,
      userId: userId,
      token: token,
      expirationDate: expirationDate,
      redirect: true
    });
};

const handleError = (errorRes: any) => {
  let errorMessage = 'An unknown error occurred!';
  if (!errorRes.error || !errorRes.error.error) {
    // If true then our error doesn't have .message key
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This e-mail already exists!';
      break;
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'The password is invalid or the user does not have a password.';
      break;
    case 'USER_DISABLED':
      errorMessage = 'The user account has been disabled by an administrator.';
  }
  // Return a non-error observable so that our overall stream doesn't die
  return of(new AuthActions.AuthenticateFail(errorMessage)); // Utility function for creating a new observable without error
};

// /* ******************* */
// EFFECTS
// /* ******************* */

@Injectable() // Needed for the abilitiy to inject things into that AuthEffects class
export class AuthEffects {

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true // Required by Firebase API, always true
        }
      ).pipe( // Call pipe on that inner switchMap observable
        tap(resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map(resData => { // Map will execute if we have no error
          return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),
        catchError(errorRes => {
          return handleError(errorRes);
          }),
        );
    })
  );

  @Effect() // Required decorator for NgRx to pick up this property as an effect
  authLogin = this.actions$.pipe( // Ongoing observable stream - must never die
    // Only continue in this observable chain if the action we react is of type LOGIN_START, all other actions will not trigger this
    ofType(AuthActions.LOGIN_START), // Define a filter for which types of effects you want to continue in this obserable stream
    switchMap((authData: AuthActions.LoginStart) => { // Create a new observable by taking anothers observables data
      return this.http.post<AuthResponseData>( // Return new Observable with HTTPClient request
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      ).pipe( // Call pipe on that inner switchMap observable
        tap(resData => {
          this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        }),
        map(resData => { // Map will execute if we have no error
          return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),
        catchError(errorRes => {
          return handleError(errorRes);
          }),
        );
      })
    );

  @Effect({dispatch: false}) // In this effects, we don't dispatch new Action afertwards, so we need to tell NgRx about this
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if (authSuccessAction.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData:
      {
        email: string
        id: string
        _token: string
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData')); // Check if there is an existing user snapchot in local storage - convert it back to JS object
      if (!userData) {
        return {type: 'DUMMY'};
      }

      const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

      if (loadedUser.token) { // Check if token is still valid
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          });

      // const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      // // Future date - current date = difference in milisecond, which is a duration until token expires
      // this.autoLogout(expirationDuration);
      }
      return {type: 'DUMMY'}; // We don't need to create an object based on a class if we need simple action, we can do it on the fly with object literal with type property set to anything
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    })
  );

  constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) {}
}
