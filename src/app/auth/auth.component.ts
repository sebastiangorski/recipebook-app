import { Component, ComponentFactoryResolver, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import * as fromApp from '../store/app.reducer';
import * as AuthAction from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective;

  private closeSub: Subscription;
  private storeSub: Subscription;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) {}

    ngOnInit() {
    this.storeSub = this.store.select('auth').subscribe(authState => {
        this.isLoading = authState.loading;
        this.error = authState.authError;
        if (this.error) {
          this.showErrorAlert(this.error);
        }
      });
    }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode; // Reversing the value
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return; // Method in case for if user hacks in and enables submit button
    }

    const email = form.value.email;
    const password = form.value.password;

    if (this.isLoginMode) {
      this.store.dispatch(new AuthAction.LoginStart({email: email, password: password}));
    } else {
     this.store.dispatch(new AuthAction.SignupStart({email: email, password: password}));
    }

    form.reset();
  }

  // For displaying error popup box with *ngIf
  onHandleError() {
    this.store.dispatch(new AuthAction.ClearError());
  }

  // For displaying error popup box programatically
  private showErrorAlert(message: string) {
    const alertCmpFactory =  this.componentFactoryResolver.resolveComponentFactory(AlertComponent); // Object that knows how to create alert component

    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);

    componentRef.instance.message = message; // Gives acces to concrete instance of the component that was created here and pass a message
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }

    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
