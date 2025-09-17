import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import CartProvider from '@/context/CartProvider';
import ScrollToTop from '@/components/common/ScrollToTop';
import HomePage from '@/HomePage';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Pedido from './pages/Pedido';
import ProductDetailPage from './pages/ProductDetailPage';
import AddressFormPage from './pages/AddressFormPage';
import UserAddressesPage from './pages/UserAddressesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Layout from './components/layout/Layout';

const fetchProductosVistos = async (email) => {
  if (!email) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productosvistos/email/${email}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function AppContent() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email) {
      queryClient.prefetchQuery({
        queryKey: ['productosVistos', currentUser.email],
        queryFn: () => fetchProductosVistos(currentUser.email),
      });
    }
  }, [currentUser, queryClient]);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [productFilterKey, setProductFilterKey] = useState(0); // Key to force ProductFilter re-render

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
    setProductFilterKey(prevKey => prevKey + 1); // Increment key to reset ProductFilter
  };

  const handleClearProductFilter = () => {
    // This function will be passed to HomePage to clear its internal filter state
    // HomePage will handle clearing its own filters
  };

  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout onFullSearch={handleGlobalSearch} />}>
          <Route index element={<HomePage globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} onClearProductFilter={handleClearProductFilter} />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="orders" element={<Pedido />} />
          <Route path="producto/:clave" element={<ProductDetailPage />} />
          <Route path="address-form" element={<AddressFormPage />} />
          <Route path="user-addresses" element={<UserAddressesPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default AppContent;
