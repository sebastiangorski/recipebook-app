import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

const initialState = {
  ingredients: [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10)
  ]
};

export function shoppingListReducer(state = initialState, action: ShoppingListActions.AddIngredient) {
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT: // Action indentifier
      return {
        ...state, // Copy old state
        ingredients: [...state.ingredients, action.payload] // copy old state ingredients
      };
      default: // Setting initial state - to handle any cases we're not explicitly handling
        return state; // Return unchanged state which will now be the initial state
  }
}
