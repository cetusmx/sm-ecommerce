import React, { createContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUserCart, saveUserCart } from '../api/cartService';
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
      // Wait until allProducts are loaded before processing the cart
      if (currentUser && allProducts) {
        // --- USER IS LOGGED IN ---
        const remoteCart = await getUserCart(currentUser.email);
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Function to hydrate cart items with full product details
        const hydrateCart = (cartToHydrate) => {
          if (!cartToHydrate) return [];
          return cartToHydrate.map(cartItem => {
            const fullProduct = allProducts.find(p => p.clave === cartItem.clave);
            if (fullProduct) {
              const priceToKeep = fullProduct.precio !== cartItem.precio ? cartItem.precio : fullProduct.precio;
              return { ...fullProduct, quantity: cartItem.quantity, precio: priceToKeep };
            }
            return null; // Or handle cases where product not found
          }).filter(Boolean); // Filter out any nulls
        };

        if (localCart.length > 0) {
          // Merge remote and local carts before hydrating
          const mergedCartData = [...remoteCart];
          localCart.forEach(localItem => {
            const existingItemIndex = mergedCartData.findIndex(item => item.clave === localItem.clave);
            if (existingItemIndex === -1) {
              mergedCartData.push(localItem);
            } else {
              // Optional: decide on quantity merge logic, here we prioritize remote
            }
          });
          
          const hydratedMergedCart = hydrateCart(mergedCartData);
          setCart(hydratedMergedCart); // Save the hydrated cart back
          await saveUserCart(currentUser.email, hydratedMergedCart);
          localStorage.removeItem('cart');

        } else {
          // Just hydrate the remote cart
          const hydratedRemoteCart = hydrateCart(remoteCart);
          setCart(hydratedRemoteCart);
        }

      } else if (!currentUser) {
        // --- USER IS LOGGED OUT ---
        // For logged-out users, we assume local storage has the full object
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(localCart);
      }
    };

    loadCartData().finally(() => setIsLoading(false));
  }, [currentUser, allProducts]); // Add allProducts to dependency array

  // Effect for saving cart when it changes
  useEffect(() => {
    // Do not save to DB or localStorage until the initial load is complete
    if (isLoading) {
      return;
    }

    if (currentUser) {
      saveUserCart(currentUser.email, cart);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, currentUser, isLoading]);

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
    setShippingAddress: setOverrideAddress, // Allow manual override
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;