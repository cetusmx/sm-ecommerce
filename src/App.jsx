import { Routes, Route } from 'react-router-dom';
import AuthProvider from '@/context/AuthProvider';
import HomePage from '@/HomePage';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Pedido from './pages/Pedido'; // Import the new Pedido component
import ProductDetailPage from './pages/ProductDetailPage'; // Import the new Product Detail Page component
import AddressFormPage from './pages/AddressFormPage'; // Import the new Address Form Page component
import UserAddressesPage from './pages/UserAddressesPage'; // Import the new User Addresses Page component
import Layout from './components/layout/Layout'; // Import the new Layout component
import "./App.css";

// Forcing a re-render to clear potential cached errors
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}> {/* Parent route for layout */}
          <Route index element={<HomePage />} /> {/* Default child route for "/" */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="orders" element={<Pedido />} />
          <Route path="producto/:clave" element={<ProductDetailPage />} />
          <Route path="address-form" element={<AddressFormPage />} />
          <Route path="user-addresses" element={<UserAddressesPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
