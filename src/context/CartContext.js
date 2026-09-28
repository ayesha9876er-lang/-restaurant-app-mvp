import React, { createContext, useReducer } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const applyPromoCode = (code) =>
    dispatch({ type: 'APPLY_PROMO', payload: code });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const subtotal = cartState.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = (subtotal * cartState.discountPercent) / 100;
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        cartState,
        addItem,
        removeItem,
        updateQuantity,
        applyPromoCode,
        clearCart,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};