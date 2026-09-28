export const initialCartState = {
  items: [],
  discountPercent: 0,
  promoCode: '',
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += 1;
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }

    case 'APPLY_PROMO': {
      const code = action.payload.toUpperCase();
      if (code === 'WELCOME10') {
        return { ...state, discountPercent: 10, promoCode: code };
      } else if (code === 'FEAST20') {
        return { ...state, discountPercent: 20, promoCode: code };
      }
      return state;
    }

    case 'CLEAR_CART':
      return initialCartState;

    default:
      return state;
  }
}