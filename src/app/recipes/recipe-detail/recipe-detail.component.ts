import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private recipeService: RecipeService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    // Getting route params is already done through observable so now we need to add yet another observable
    // To then take this route params and get our recipe. There are two ways of doing it:

    // One way - create new observable chain inside of that function we passed to subsribe og that outer chain
    // this.route.params.subscribe(
    //   (params: Params) => {
    //     this.id = +params['id']; // Fetching ID and storing it
    //     this.store.select('recipes').pipe(
    //       map(recipesState => {
    //         return recipesState.recipes.find((recipe, index) => { // Find method takes a function where we get each recipe and it's index
    //           return index === this.id;
    //         });
    //       })
    //     ).subscribe(recipe => {
    //       this.recipe = recipe;
    //     });
    //   }
    // );

    // Second way - convert this all into one big observable chain
    // Switch map - to swich our params observable to the store observable
    this.route.params.pipe(map(params => {
      return +params['id'];
    }), switchMap(id => {
      this.id = id;
      return this.store.select('recipes');
    }), map(recipesState => {
      return recipesState.recipes.find((recipe, index) => { // Find method takes a function where we get each recipe and it's index
        return index === this.id;
      });
    })).subscribe(recipe => {
          this.recipe = recipe;
        });
  }

  onAddToShoppingList() {
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
    //this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route}); // Works the same, just more complex path
  }

  onDeleteRecipe() {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}
