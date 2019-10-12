import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Recipe } from './recipe.model';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Injectable({providedIn: 'root'})
export class RecipeResolverService implements Resolve<Recipe[]> {

  constructor(private store: Store<fromApp.AppState>, private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // First check if we do have recipes loaded, and fetch new ones only if we don't
    //  const recipes = this.recipesService.getRecipes();

    //  if (recipes.length === 0) {
    //    return this.dataStorageService.fetchRecipes();
    //    // We don't have to subscribe here because the resolver will subscribe for us to basically find out once the data is there
    //  } else {
    //    return recipes;
    //  }

    // Tricky part - resolver expects an Observable as returned value here on the resolve method and it waits for this obseravble to complete before it loads the router for which we added this resolver. The problem is, when we dispatch an action we don't get back an observable.
    return this.store.select('recipes').pipe(
      take(1),
      map(recipeState => {
      return recipeState.recipes;
    }),
    switchMap(recipes => {
      if (recipes.length === 0) {
        this.store.dispatch(new RecipesActions.FetchRecipes());
        return this.actions$.pipe(ofType(RecipesActions.SET_RECIPES), take(1));
        // Listen to SET_RECIPES action to occur (becuase we know recipes are there) to complete this resolve observable.
      } else {
        return of(recipes); // We don't sent any request if we already have recipes
      }
    }));

    // Now the resolver dispatches this but also waits for Recipes to be set.
  }
}
