import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIngredientIndex: number;
}

export interface AppState {
  shoppingList: State;
}

const initialState: State = {
  ingredients: [ new Ingredient('Apples', 5), new Ingredient('Tomatoes', 10) ],
  editedIngredient: null,
  editedIngredientIndex: -1
};

export function shoppingListReducer(state: State = initialState, action: ShoppingListActions.ShoppingListActions) {
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT: // Action indentifier
      return {
        ...state, // Copy old state
        ingredients: [...state.ingredients, action.payload] // copy old state ingredients
      };

    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload] // Adding elements of payload array
      };

    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = state.ingredients[state.editedIngredientIndex]; // Choose ingredient in the array with the index from the state
      const updatedIngredient = { // an object because ingredient is an object
        ...ingredient,
        ...action.payload // Overwriting old ingredient with a new one
      };
      const updatedIngredients = [...state.ingredients]; // New array with a copy of old array state
      updatedIngredients[state.editedIngredientIndex] = updatedIngredient; // Overwrite the existing element at given index with a new element
      // Now updatedIngredients is an array of ingredients where we overwrote one ingredient

      return {
        ...state,
        ingredients: updatedIngredients,
        editedIngredientIndex: -1,
        editedIngredient: null
      };

    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ig, igIndex) => {
          // Return true or false decining wheater we want to keep that ingredient we're currently looking at or not
          // We want to keep ingredient if its index is not equal to the index passed into action.payload
          return igIndex !== state.editedIngredientIndex;
        }),
        // Filter will always give us a new array (a copy), it will take an array, run certain function we passed in as an argument on every element of the array. And if that function returns true, then the element for which it's executing this will be part of that new array, othwerwise it will not

        editedIngredientIndex: -1,
        editedIngredient: null
      };

    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIngredientIndex: action.payload,
        editedIngredient: { ...state.ingredients[action.payload] } // Copy ingredient from Ingredient array
      };

    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null,
        editedIngredientIndex: -1
      };

      default: // Setting initial state - to handle any cases we're not explicitly handling
        return state; // Return unchanged state which will now be the initial state
  }
}
