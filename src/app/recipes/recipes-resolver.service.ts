import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Recipe } from './recipe.model';
import { DataStorageService } from '../shared/data-storage.service';
import { RecipeService } from './recipe.service';

@Injectable({providedIn: 'root'})
export class RecipeResolverService implements Resolve<Recipe[]> {

  constructor(private dataStorageService: DataStorageService, private recipesService: RecipeService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // First check if we do have recipes loaded, and fetch new ones only if we don't
     const recipes = this.recipesService.getRecipes();

     if (recipes.length === 0) {
       return this.dataStorageService.fetchRecipes();
       // We don't have to subscribe here because the resolver will subscribe for us to basically find out once the data is there
     } else {
       return recipes;
     }

  }
}
