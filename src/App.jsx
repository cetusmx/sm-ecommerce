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
import CheckoutPage from './pages/CheckoutPage';
import Layout from './components/layout/Layout';
import "./styles/notifications.css";
import "./styles/global.css";
import "./App.css";
import AppContent from './AppContent';

function App() {

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
