import React, { createContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth
import { getUserCart, saveUserCart } from '../api/cartService'; // Import API functions

export const CartContext = createContext();

// This function now lives here, as it's a cart-related concern.
const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [shippingAddress, setShippingAddress] = useState(null);
  const { currentUser } = useAuth(); // Get current user from AuthContext
  const isInitialMount = useRef(true);

  // Effect for loading cart AND shipping address on user state change
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        // --- USER IS LOGGED IN ---

        // 1. Load remote cart and merge with local
        const remoteCart = await getUserCart(currentUser.email);
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (localCart.length > 0) {
          const mergedCart = [...remoteCart];
          localCart.forEach(localItem => {
            const existingItemIndex = mergedCart.findIndex(item => item.clave === localItem.clave);
            if (existingItemIndex === -1) {
              mergedCart.push(localItem);
            }
          });
          setCart(mergedCart);
          await saveUserCart(currentUser.email, mergedCart);
          localStorage.removeItem('cart');
        } else {
          setCart(remoteCart);
        }

        // 2. Load shipping addresses
        const addresses = await fetchAddresses(currentUser.email);
        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.orden_domicilio === 'Predeterminado') || addresses[addresses.length - 1];
          setShippingAddress(defaultAddress);
        }

      } else {
        // --- USER IS LOGGED OUT ---
        // 1. Load cart from local storage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(localCart);
        // 2. Clear shipping address
        setShippingAddress(null);
      }
    };

    loadData();
  }, [currentUser]);

  // Effect for saving cart when it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (currentUser) {
      console.log('[CartProvider Save] currentUser:', currentUser);
      console.log('[CartProvider Save] currentUser.email:', currentUser?.email);
      console.log('[CartProvider Save] cart:', cart);
      saveUserCart(currentUser.email, cart);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

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
      setCart(cart.map((item) =>
        item.clave === itemClave ? { ...item, quantity: newQuantity } : item
      ));
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
    shippingAddress,
    setShippingAddress,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;