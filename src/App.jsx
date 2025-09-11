import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthProvider from '@/context/AuthProvider';
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
import Layout from './components/layout/Layout';
import "./App.css";

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="orders" element={<Pedido />} />
            <Route path="producto/:clave" element={<ProductDetailPage />} />
            <Route path="address-form" element={<AddressFormPage />} />
            <Route path="user-addresses" element={<UserAddressesPage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;