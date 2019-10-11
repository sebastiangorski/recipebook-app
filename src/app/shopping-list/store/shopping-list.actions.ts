import { Action } from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

export const ADD_INGREDIENT = '[Shopping List] Add Ingredient';
export const ADD_INGREDIENTS = '[Shopping List] Add Ingredients';
export const UPDATE_INGREDIENT = '[Shopping List] Update Ingredient';
export const DELETE_INGREDIENT = '[Shopping List] Delete Ingredient';
export const START_EDIT = '[Shopping List] Start Edit';
export const STOP_EDIT = '[Shopping List] Stop Edit';

export class AddIngredient implements Action {
  // Action interface forces us to structure this class in a certain way - adding type property, but only that, others like payload are optional
  readonly type = ADD_INGREDIENT;

  constructor(public payload: Ingredient) {} // Public to be able to access payload from inside reducer where we extract it to store that ingredient in the ingredients array
}

export class AddIngredients implements Action {
  readonly type = ADD_INGREDIENTS;

  constructor(public payload: Ingredient[]) {}
}

export class UpdateIngredient implements Action {
  readonly type = UPDATE_INGREDIENT;

  constructor(public payload: Ingredient) {}
}

export class DeleteIngredient implements Action {
  readonly type = DELETE_INGREDIENT;
}

export class StartEdit implements Action {
  readonly type = START_EDIT;

  constructor(public payload: number) {} // The number of the ingredient we want to edit
}

export class StopEdit implements Action {
  readonly type = STOP_EDIT;
}

// This is pure TypeScript feature
export type ShoppingListActions = // Union type
  | AddIngredient
  | AddIngredients
  | UpdateIngredient
  | DeleteIngredient
  | StartEdit
  | StopEdit
  ;
// This says that the type od ShoppingList Actions is all of the above
