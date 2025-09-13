import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/api/firebase/firebase';
import { AuthContext } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProductosVistos } from '@/api/productosVistosApi';

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user && user.email) {
        queryClient.prefetchQuery({
          queryKey: ['productosVistos', user.email],
          queryFn: () => fetchProductosVistos(user.email),
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    authLoading: loading, // Expose the loading state
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
