import React, { createContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUserCart, saveUserCart } from '../api/cartService';
import { useQuery } from '@tanstack/react-query'; // Import useQuery

export const CartContext = createContext();

// We can keep fetchAddresses here or move it to a dedicated API file if it's used elsewhere
const fetchUserAddresses = async (userEmail) => { // Renamed to avoid conflict if UserAddressesPage also has one
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
  // We will derive shippingAddress from the query data, so no need for useState here
  // const [shippingAddress, setShippingAddress] = useState(null);
  const { currentUser } = useAuth();
  const isInitialMount = useRef(true);

  // Use useQuery to fetch addresses
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchUserAddresses(currentUser.email),
    enabled: !!currentUser?.email,
  });

  // Derive shippingAddress from the fetched addresses
  const shippingAddress = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return addresses.find(addr => addr.orden_domicilio === 'Predeterminado') || addresses[addresses.length - 1];
    }
    return null;
  }, [addresses]);

  // Effect for loading cart on user state change
  useEffect(() => {
    const loadCartData = async () => {
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

        // No need to load shipping addresses here anymore, useQuery handles it.

      } else {
        // --- USER IS LOGGED OUT ---
        // 1. Load cart from local storage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(localCart);
        // 2. shippingAddress will be null because currentUser is null, and useQuery is disabled.
      }
    };

    loadCartData();
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
    shippingAddress, // shippingAddress is now derived from useQuery
    // setShippingAddress, // No longer needed as it's derived
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;