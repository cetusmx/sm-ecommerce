import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './AddressButton.module.css';
// Assuming useAuth is available from AuthProvider context
import { useAuth } from '@/context/AuthContext'; 

const AddressButton = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth(); // Uncomment when useAuth is implemented

  const handleClick = () => {
    if (isLoggedIn) {
      console.log("Logueado");
      navigate('/user-addresses');
    } else {
      // Store current location to redirect after login/signup
      navigate('/login', { state: { from: '/user-addresses' } });
      // Or if no account, navigate('/signup', { state: { from: '/user-addresses' } });
    }
  };

  return (
    <button className={styles['address-button']} onClick={handleClick}>
      <div className={styles['address-icon-wrapper']}>
        <FaMapMarkerAlt className={styles['address-icon']} />
      </div>
      <span className={styles['address-text']}>Enviar a</span>
    </button>
  );
};

export default AddressButton;
