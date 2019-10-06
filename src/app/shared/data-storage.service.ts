import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, take, exhaustMap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({providedIn: 'root'}) // Because we will have another service injected here
export class DataStorageService {
 constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) {}

 storeRecipes() {
  const recipes = this.recipeService.getRecipes();
  this.http.put('https://angular-recipebook-sg.firebaseio.com/recipes.json', recipes).subscribe(response => {
    console.log(response);
  });

  // If we would want to send one recipe to the backend we could use .post, but we want to store all recipes and overwrite any previous recipes we stored. That's why we use .put() with Firebase. Different API might use different method.
 }

 fetchRecipes() {
  // Take tells rxjs that we want to only take 1 value from that observable and then unsubscibe from it
  // ExhaustMap waits for the first observable to finish (user - pipe take). Thereafter it gives us that user so wen can pass it insidte exhaustmap function (there we get the data from that first obseravle) and there return another obseravle that reoplaces the first one ( so kind fo switches to next one - http request observable)
  // After the obseravle chain switches to http observable, and since we already are in pipe method call we can simply add more methods as next steps after the exhaust map
  // In the end we return this whole observable

  return this.authService.user.pipe(take(1), exhaustMap(user => {
      return this.http.get<Recipe[]>('https://angular-recipebook-sg.firebaseio.com/recipes.json',
        {
        // For Firebase and Real Time Database REST API we add a token as a query param in the URL. For other APIs you add it as a header in the request.
          params: new HttpParams().set('auth', user.token)
        }
      );
   }), map(recipes => { // RXJS operator
    return recipes.map(recipe => { // Called on an array - so normal JS array method to transform elements in the array
      return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
      // Spread to copy all existing data, then if there are set ingredients then set it equal to recipe ingredients, BUT if tere are no ingredients set then set an empty array
    });
  }), tap(recipes => {
    this.recipeService.setRecipes(recipes);
  }));
 }
}
