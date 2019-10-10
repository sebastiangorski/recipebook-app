import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import { Subscription, Observable } from 'rxjs';
import * as fromShoppingList from './store/shopping-list.reducer';
import * as ShoppingListActions from './store/shopping-list.actions';


@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  ingredients: Observable<{ingredients: Ingredient[]}>; // Same data format as in the Store
  // private subscription: Subscription;


  constructor(private slService: ShoppingListService, private store: Store<fromShoppingList.AppState>) { }

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList'); // Select a slice of the store, gives us an Observable
    // this.ingredients = this.slService.getIngredients();
    // this.subscription =  this.slService.ingredientsChanged.subscribe((ingredients: Ingredient[]) => {
    //   this.ingredients = ingredients; // Getting informed from Service that something changed
    // });
  }

  onEditItem(index: number) {
    // this.slService.startedEditing.next(index);
    this.store.dispatch(new ShoppingListActions.StartEdit(index));
  }
}
