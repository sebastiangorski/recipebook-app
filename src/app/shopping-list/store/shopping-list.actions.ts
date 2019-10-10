import { Action } from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

export const ADD_INGREDIENT = 'ADD_INGREDIENT';

export class AddIngredient implements Action {
  // Action interface forces us to structure this class in a certain way - adding type property, but only that, others like payload are optional
  readonly type = ADD_INGREDIENT;

  constructor(public payload: Ingredient) {} // Public to be able to access payload from inside reducer where we extract it to store that ingredient in the ingredients array
}
