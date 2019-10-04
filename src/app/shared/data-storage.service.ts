import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';

@Injectable({providedIn: 'root'}) // Because we will have another service injected here
export class DataStorageService {
 constructor(private http: HttpClient, private recipeService: RecipeService) {}

 storeRecipes() {
  const recipes = this.recipeService.getRecipes();
  this.http.put('https://angular-recipebook-sg.firebaseio.com/recipes.json', recipes).subscribe(response => {
    console.log(response);
  });

  // If we would want to send one recipe to the backend we could use .post, but we want to store all recipes and overwrite any previous recipes we stored. That's why we use .put() with Firebase. Different API might use different method.
 }

 fetchRecipes() {
  return this.http.get<Recipe[]>('https://angular-recipebook-sg.firebaseio.com/recipes.json')
  .pipe(map(recipes => { // RXJS operator
    return recipes.map(recipe => { // Called on an array - so normal JS array method to transform elements in the array
      return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
      // Spread to copy all existing data, then if there are set ingredients then set it equal to recipe ingredients, BUT if tere are no ingredients set then set an empty array
    });
  }), tap(recipes => {
    this.recipeService.setRecipes(recipes);
  }));
 }
}
