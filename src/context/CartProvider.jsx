
import React, { createContext, useState, useMemo } from 'react';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addItem = (item, quantity) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex((i) => i.clave === item.clave);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const removeItem = (itemClave) => {
    setCart(cart.filter((item) => item.clave !== itemClave));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateItemQuantity = (itemClave, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemClave);
    } else {
      const updatedCart = cart.map((item) =>
        item.clave === itemClave ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (parseFloat(item.precio) * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const value = {
    cart,
    addItem,
    removeItem,
    clearCart,
    updateItemQuantity,
    cartTotal,
    cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
