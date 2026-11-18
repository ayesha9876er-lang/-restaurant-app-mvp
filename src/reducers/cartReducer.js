

export const initialCartState = {
  items: [],
  discountPercent: 0,
  promoCode: '',
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
  const newItem = action.payload;

  // _id ko pehle lo, warna id lo. "undefined" wali fake ID ko reject karo
  const rawId = newItem?._id ?? newItem?.id;
  const itemId = rawId && String(rawId) !== 'undefined' ? String(rawId) : '';

  // Do not add an item without an ID
  if (!itemId) {
    console.warn('Cart item ID is missing:', newItem);
    return state;
  }

      // Check whether this item already exists in the cart
      const existingIndex = state.items.findIndex(
        (item) => String(item.id) === itemId
      );

      // If item exists, increase its quantity
      if (existingIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: (Number(item.quantity) || 0) + 1 }
            : item
        );

        return {
          ...state,
          items: updatedItems,
        };
      }

      // Otherwise, add it as a new item
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...newItem,
            id: itemId,
            quantity: 1,
          },
        ],
      };
    }

    case 'REMOVE_ITEM': {
      const removeId = String(action.payload);

      return {
        ...state,
        items: state.items.filter(
          (item) => String(item.id) !== removeId
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const updateId = String(id);
      const newQuantity = Number(quantity);

      if (newQuantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => String(item.id) !== updateId
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          String(item.id) === updateId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      };
    }

    case 'APPLY_PROMO': {
      const code = String(action.payload || '').trim().toUpperCase();

      if (code === 'WELCOME10') {
        return {
          ...state,
          discountPercent: 10,
          promoCode: code,
        };
      }

      if (code === 'FEAST20') {
        return {
          ...state,
          discountPercent: 20,
          promoCode: code,
        };
      }

      return state;
    }

    case 'CLEAR_CART':
      return {
        ...initialCartState,
        items: [],
      };

    default:
      return state;
  }
}
