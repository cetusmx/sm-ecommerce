import React, { useEffect, useState, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/api/firebase/firebase';
import { AuthContext } from '@/context/AuthContext';
import { CartContext } from '@/context/CartProvider'; // Import CartContext

const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setShippingAddress } = useContext(CartContext); // Get the setter from CartContext

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    setShippingAddress(null); // Clear shipping address on logout
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User has logged in, fetch their addresses
        const addresses = await fetchAddresses(user.email);
        if (addresses && addresses.length > 0) {
          // Find default or fallback to the most recent one
          const defaultAddress = addresses.find(addr => addr.orden_domicilio === 'Predeterminado') || addresses[addresses.length - 1];
          setShippingAddress(defaultAddress);
        }
      } else {
        // User has logged out
        setShippingAddress(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setShippingAddress]);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;