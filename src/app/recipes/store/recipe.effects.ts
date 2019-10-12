import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as RecipesActions from './recipe.actions';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffets {

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => {
      return this.http
      .get<Recipe[]>(
        'https://angular-recipebook-sg.firebaseio.com/recipes.json'
      );
    }),
    map(recipes => { // RXJS operator
      return recipes.map(recipe => { // Called on an array - so normal JS array method to transform elements in the array
        return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
        // Spread to copy all existing data, then if there are set ingredients then set it equal to recipe ingredients, BUT if tere are no ingredients set then set an empty array
      });
    }),
    map(recipes => {
      return new RecipesActions.SetRecipes(recipes);
    })
    );

  @Effect({dispatch: false})
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')), // Allows to merge value from another observable into this observable stream
    switchMap(([actionData, recipesState]) => { // actionData coming from ofType, recipesState coming from withLatestFrom
      // I'm using array destructuting syntax here, which means that I store the two elements this array wil have in variables
      return this.http.put('https://angular-recipebook-sg.firebaseio.com/recipes.json', recipesState.recipes);
    })
  );



  constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {}
}
