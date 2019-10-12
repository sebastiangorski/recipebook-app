import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipe.actions';

export interface State {
  recipes: Recipe[];
};

const initialState: State = {
  recipes: []
};

export function recipeReducer(state = initialState, action: RecipesActions.RecipesActions) {
  switch (action.type) {
    case RecipesActions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload] // Pull all elements from Recipes array and put it in the new array in State
      };

    case RecipesActions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };

    case RecipesActions.UPDATE_RECIPE:
      const updatedRecipe = {
        ...state.recipes[action.payload.index], // Get recipe with index we want to change
        ...action.payload.newRecipe // Exctract all properties from new recipe and marge them to this object which is a copy of old recipe
        // This will overwrite all the values of the old recipe with updated values
      };

      const updatedRecipes = [...state.recipes];
      updatedRecipes[action.payload.index] = updatedRecipe; // Overwrite that element at this index in copied list

      return {
        ...state,
        recipes: updatedRecipes
      };

    case RecipesActions.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter((recipe, index) => { // Filter always returns new list so we don't mutate old list
          return index !== action.payload;
        })
      };

    default:
      return state;
  }
}
