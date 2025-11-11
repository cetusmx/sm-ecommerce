import React, { createContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUserCart, saveUserCart, clearCartInDB } from '../api/cartService';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { fetchProducts } from '../api/productsApi';

export const CartContext = createContext();

// We can keep fetchAddresses here or move it to a dedicated API file if it's used elsewhere
const fetchUserAddresses = async (userEmail) => { // Renamed to avoid conflict if UserAddressesPage also has one
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404 || response.status === 500) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // We will derive shippingAddress from the query data, so no need for useState here
  // const [shippingAddress, setShippingAddress] = useState(null);
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [overrideAddress, setOverrideAddress] = useState(null);

  // Fetch all products to enable cart hydration
  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });



  // Use useQuery to fetch addresses
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchUserAddresses(currentUser.email),
    enabled: !!currentUser?.email,
  });

  // Derive default shippingAddress from the fetched addresses
  const defaultAddress = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return addresses.find(addr => addr.orden_domicilio === 'Predeterminado') || addresses[addresses.length - 1];
    }
    return null;
  }, [addresses]);

  // The final shipping address is the override, or the default if no override is set.
  const shippingAddress = overrideAddress || defaultAddress;

  // Effect for loading cart on user state change
  useEffect(() => {
    const loadCartData = async () => {
      setIsLoading(true);

      // --- Phase 1: Immediate Load from localStorage for ALL users ---
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(localCart); // Set state immediately. No more flash of empty cart.

      // --- Phase 2: Wait for dependencies and then hydrate/sync ---
      if (!allProducts) {
        // Products are not ready, we will wait for the effect to re-run when they are.
        return;
      }

      // Now that products are loaded, we can proceed with hydration and synchronization.
      const hydrateCart = (cartToHydrate) => {
        if (!cartToHydrate) return [];
        return cartToHydrate.map(cartItem => {
          const fullProduct = allProducts.find(p => p.clave === cartItem.clave);
          if (fullProduct) {
            const priceToKeep = fullProduct.precio !== cartItem.precio ? cartItem.precio : fullProduct.precio;
            return { ...fullProduct, quantity: cartItem.quantity, precio: priceToKeep };
          }
          return cartItem; // Instead of null, return the original item to prevent data loss
        }).filter(Boolean); // Filter out any nulls
      };

      if (currentUser) {
        // --- LOGGED IN USER: Sync with DB, merge, and hydrate ---
        const remoteCart = await getUserCart(currentUser.email);

        // Merge logic: local items take precedence for quantity, but remote items are added.
        const mergedMap = new Map();
        localCart.forEach(item => mergedMap.set(item.clave, item));
        remoteCart.forEach(item => {
          if (!mergedMap.has(item.clave)) {
            mergedMap.set(item.clave, item);
          }
        });
        
        const mergedCart = Array.from(mergedMap.values());
        const finalHydratedCart = hydrateCart(mergedCart);

        setCart(finalHydratedCart);
        localStorage.setItem('cart', JSON.stringify(finalHydratedCart)); // Persist the fully synced and hydrated cart
        await saveUserCart(currentUser.email, finalHydratedCart);

      } else {
        // --- GUEST USER: Just hydrate the local cart we already loaded ---
        const hydratedLocalCart = hydrateCart(localCart);
        setCart(hydratedLocalCart);
      }

      setIsLoading(false);
    };

    loadCartData();
  }, [currentUser, allProducts]);

  const isInitialMount = useRef(true);

  // The auto-save useEffect has been removed to adopt an imperative save model.

  const addItem = (item, quantity) => {
    const totalItemsToAdd = quantity * (item.cant_por_empaque || 1);
    let newCart;
    const existingItemIndex = cart.findIndex((i) => i.clave === item.clave);

    if (existingItemIndex > -1) {
      newCart = cart.map((cartItem, index) =>
        index === existingItemIndex
          ? { ...cartItem, quantity: cartItem.quantity + totalItemsToAdd }
          : cartItem
      );
    } else {
      newCart = [...cart, { ...item, quantity: totalItemsToAdd }];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (currentUser) {
      saveUserCart(currentUser.email, newCart);
    }
  };

  const removeItem = (itemClave) => {
    const newCart = cart.filter((item) => item.clave !== itemClave);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (currentUser) {
      saveUserCart(currentUser.email, newCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    if (currentUser) {
      clearCartInDB(currentUser.email);
    }
  };

  const updateItemQuantity = (itemClave, newQuantity) => {
    const itemToUpdate = cart.find(item => item.clave === itemClave);
    if (!itemToUpdate) return;

    const packageSize = itemToUpdate.cant_por_empaque || 1;
    const minQuantity = itemToUpdate.cantidad_minima || 1;

    // If the new quantity is not a valid multiple, do not update.
    // This is a safeguard, as the UI "step" attribute should prevent this.
    if (newQuantity > 0 && newQuantity % packageSize !== 0) {
      console.warn(`Invalid quantity ${newQuantity} for ${itemClave}. Must be a multiple of ${packageSize}.`);
      // Optionally, provide user feedback here
      return;
    }
    
    // Ensure the quantity is not below the minimum, unless it's being set to 0 to remove it.
    if (newQuantity > 0 && newQuantity < minQuantity) {
      // Do not update if below minimum
      return;
    }

    if (newQuantity <= 0) {
      removeItem(itemClave); // removeItem already handles saving
      return;
    }

    const newCart = cart.map((item) =>
      item.clave === itemClave ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (currentUser) {
      saveUserCart(currentUser.email, newCart);
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
    setShippingAddress: setOverrideAddress, // Allow manual override
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;